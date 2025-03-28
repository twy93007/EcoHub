from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from fastapi import UploadFile
import os

from .models import Dataset, DatasetVersion, PermissionLevel, DatasetMetadata, DataQuality
from .storage import FileStorage
from .permission import DatasetPermissionService
from .metadata import DatasetMetadataService
from ..database import get_db
from ..auth.models import User

class DatasetService:
    def __init__(self, db: Session):
        self.db = db
        self.storage = FileStorage()
        self.permission_service = DatasetPermissionService(db)
        self.metadata_service = DatasetMetadataService(db)

    def create_dataset(self, dataset: Dataset, user_id: int) -> Dataset:
        """创建新数据集"""
        db_dataset = Dataset(
            name=dataset.name,
            description=dataset.description,
            version=dataset.version,
            owner_id=user_id,
            is_public=dataset.is_public,
            tags=dataset.tags,
            metadata=dataset.metadata
        )
        self.db.add(db_dataset)
        self.db.commit()
        self.db.refresh(db_dataset)
        
        # 为创建者授予所有者权限
        self.permission_service.grant_permission(db_dataset.id, user_id, PermissionLevel.OWNER)
        
        return db_dataset

    def get_dataset(self, dataset_id: int, user_id: int) -> Optional[Dataset]:
        """获取数据集详情"""
        # 检查权限
        if not self.permission_service.has_permission(dataset_id, user_id, PermissionLevel.VIEWER):
            return None
            
        return self.db.query(Dataset).filter(Dataset.id == dataset_id).first()

    def list_datasets(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 10,
        search: Optional[str] = None,
        tags: Optional[List[str]] = None
    ) -> List[Dataset]:
        """获取数据集列表"""
        # 获取用户有权限的数据集ID列表
        permissions = self.permission_service.list_permissions(user_id)
        dataset_ids = [p.dataset_id for p in permissions]
        
        # 构建查询
        query = self.db.query(Dataset).filter(
            or_(
                Dataset.id.in_(dataset_ids),
                Dataset.is_public == True
            )
        )

        if search:
            query = query.filter(
                or_(
                    Dataset.name.ilike(f"%{search}%"),
                    Dataset.description.ilike(f"%{search}%")
                )
            )

        if tags:
            for tag in tags:
                query = query.filter(Dataset.tags.contains([tag]))

        return query.offset(skip).limit(limit).all()

    def update_dataset(self, dataset_id: int, dataset: Dataset, user_id: int) -> Optional[Dataset]:
        """更新数据集"""
        # 检查权限
        if not self.permission_service.has_permission(dataset_id, user_id, PermissionLevel.EDITOR):
            return None

        db_dataset = self.get_dataset(dataset_id, user_id)
        if not db_dataset:
            return None

        for key, value in dataset.dict(exclude_unset=True).items():
            setattr(db_dataset, key, value)
        
        db_dataset.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(db_dataset)
        return db_dataset

    def delete_dataset(self, dataset_id: int, user_id: int) -> bool:
        """删除数据集"""
        # 检查权限
        if not self.permission_service.has_permission(dataset_id, user_id, PermissionLevel.ADMIN):
            return False

        db_dataset = self.get_dataset(dataset_id, user_id)
        if not db_dataset:
            return False

        # 删除数据集文件
        self.storage.delete_dataset_files(dataset_id)
        
        # 删除权限记录
        permissions = self.permission_service.list_permissions(dataset_id)
        for permission in permissions:
            self.permission_service.revoke_permission(dataset_id, permission.user_id)
        
        # 删除数据库记录
        self.db.delete(db_dataset)
        self.db.commit()
        return True

    async def create_version(
        self,
        dataset_id: int,
        version: DatasetVersion,
        file: UploadFile,
        user_id: int
    ) -> Optional[DatasetVersion]:
        """创建数据集新版本"""
        # 检查权限
        if not self.permission_service.has_permission(dataset_id, user_id, PermissionLevel.EDITOR):
            return None

        db_dataset = self.get_dataset(dataset_id, user_id)
        if not db_dataset:
            return None

        # 保存文件
        file_path, file_size, checksum = await self.storage.save_file(
            file, dataset_id, version.version
        )

        # 创建版本记录
        db_version = DatasetVersion(
            dataset_id=dataset_id,
            version=version.version,
            description=version.description,
            created_by=user_id,
            file_path=file_path,
            file_size=file_size,
            checksum=checksum
        )
        self.db.add(db_version)
        self.db.commit()
        self.db.refresh(db_version)
        return db_version

    def get_version(self, dataset_id: int, version: str, user_id: int) -> Optional[DatasetVersion]:
        """获取数据集版本详情"""
        # 检查权限
        if not self.permission_service.has_permission(dataset_id, user_id, PermissionLevel.VIEWER):
            return None

        db_dataset = self.get_dataset(dataset_id, user_id)
        if not db_dataset:
            return None

        return self.db.query(DatasetVersion).filter(
            and_(
                DatasetVersion.dataset_id == dataset_id,
                DatasetVersion.version == version
            )
        ).first()

    def list_versions(self, dataset_id: int, user_id: int) -> List[DatasetVersion]:
        """获取数据集版本列表"""
        # 检查权限
        if not self.permission_service.has_permission(dataset_id, user_id, PermissionLevel.VIEWER):
            return []

        db_dataset = self.get_dataset(dataset_id, user_id)
        if not db_dataset:
            return []

        return self.db.query(DatasetVersion).filter(
            DatasetVersion.dataset_id == dataset_id
        ).order_by(DatasetVersion.created_at.desc()).all()

    def get_version_file(self, dataset_id: int, version: str, user_id: int) -> Optional[str]:
        """获取版本文件路径"""
        # 检查权限
        if not self.permission_service.has_permission(dataset_id, user_id, PermissionLevel.VIEWER):
            return None

        db_version = self.get_version(dataset_id, version, user_id)
        if not db_version:
            return None
        return self.storage.get_file(dataset_id, version, os.path.basename(db_version.file_path))

    def grant_permission(
        self,
        dataset_id: int,
        target_user_id: int,
        permission_level: PermissionLevel,
        user_id: int
    ) -> bool:
        """授予用户对数据集的权限"""
        # 检查权限
        if not self.permission_service.has_permission(dataset_id, user_id, PermissionLevel.ADMIN):
            return False

        # 不能修改所有者的权限
        if self.permission_service.is_owner(dataset_id, target_user_id):
            return False

        # 不能授予高于自己的权限级别
        current_level = self.permission_service.get_permission_level(dataset_id, user_id)
        if permission_level.value > current_level.value:
            return False

        self.permission_service.grant_permission(dataset_id, target_user_id, permission_level)
        return True

    def revoke_permission(
        self,
        dataset_id: int,
        target_user_id: int,
        user_id: int
    ) -> bool:
        """撤销用户对数据集的权限"""
        # 检查权限
        if not self.permission_service.has_permission(dataset_id, user_id, PermissionLevel.ADMIN):
            return False

        # 不能修改所有者的权限
        if self.permission_service.is_owner(dataset_id, target_user_id):
            return False

        return self.permission_service.revoke_permission(dataset_id, target_user_id)

    def create_dataset_with_metadata(
        self,
        dataset: Dataset,
        metadata: DatasetMetadata,
        user_id: int
    ) -> Optional[Dataset]:
        """创建数据集及其元数据"""
        db_dataset = self.create_dataset(dataset, user_id)
        if not db_dataset:
            return None

        metadata.dataset_id = db_dataset.id
        db_metadata = self.metadata_service.create_metadata(db_dataset.id, metadata, user_id)
        if not db_metadata:
            # 如果元数据创建失败，删除数据集
            self.delete_dataset(db_dataset.id, user_id)
            return None

        return db_dataset

    def get_dataset_with_metadata(self, dataset_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        """获取数据集及其元数据"""
        dataset = self.get_dataset(dataset_id, user_id)
        if not dataset:
            return None

        metadata = self.metadata_service.get_metadata(dataset_id, user_id)
        if not metadata:
            return None

        return {
            "dataset": dataset,
            "metadata": metadata
        }

    def update_dataset_metadata(
        self,
        dataset_id: int,
        metadata: DatasetMetadata,
        user_id: int
    ) -> Optional[DatasetMetadata]:
        """更新数据集元数据"""
        return self.metadata_service.update_metadata(dataset_id, metadata, user_id)

    def update_dataset_quality(
        self,
        dataset_id: int,
        quality: DataQuality,
        user_id: int
    ) -> Optional[DatasetMetadata]:
        """更新数据集质量指标"""
        return self.metadata_service.update_quality_metrics(dataset_id, quality, user_id)

    def update_dataset_statistics(
        self,
        dataset_id: int,
        statistics: Dict[str, Any],
        user_id: int
    ) -> Optional[DatasetMetadata]:
        """更新数据集统计信息"""
        return self.metadata_service.update_statistics(dataset_id, statistics, user_id)

    def search_datasets(
        self,
        user_id: int,
        keywords: Optional[List[str]] = None,
        data_level: Optional[str] = None,
        source_type: Optional[str] = None,
        min_quality: Optional[float] = None,
        skip: int = 0,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """搜索数据集及其元数据"""
        metadata_list = self.metadata_service.search_metadata(
            user_id,
            keywords,
            data_level,
            source_type,
            min_quality,
            skip,
            limit
        )

        result = []
        for metadata in metadata_list:
            dataset = self.get_dataset(metadata.dataset_id, user_id)
            if dataset:
                result.append({
                    "dataset": dataset,
                    "metadata": metadata
                })

        return result 