from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from .models import DatasetMetadata, DataLevel, DataSource, DataQuality
from .permission import DatasetPermissionService

class DatasetMetadataService:
    def __init__(self, db: Session):
        self.db = db
        self.permission_service = DatasetPermissionService(db)

    def create_metadata(
        self,
        dataset_id: int,
        metadata: DatasetMetadata,
        user_id: int
    ) -> Optional[DatasetMetadata]:
        """创建数据集元数据"""
        # 检查权限
        if not self.permission_service.has_permission(dataset_id, user_id, PermissionLevel.EDITOR):
            return None

        db_metadata = DatasetMetadata(
            dataset_id=dataset_id,
            title=metadata.title,
            description=metadata.description,
            keywords=metadata.keywords,
            data_level=metadata.data_level,
            source=metadata.source.dict(),
            quality=metadata.quality.dict(),
            schema=metadata.schema,
            statistics=metadata.statistics
        )
        self.db.add(db_metadata)
        self.db.commit()
        self.db.refresh(db_metadata)
        return db_metadata

    def get_metadata(self, dataset_id: int, user_id: int) -> Optional[DatasetMetadata]:
        """获取数据集元数据"""
        # 检查权限
        if not self.permission_service.has_permission(dataset_id, user_id, PermissionLevel.VIEWER):
            return None

        return self.db.query(DatasetMetadata).filter(
            DatasetMetadata.dataset_id == dataset_id
        ).first()

    def update_metadata(
        self,
        dataset_id: int,
        metadata: DatasetMetadata,
        user_id: int
    ) -> Optional[DatasetMetadata]:
        """更新数据集元数据"""
        # 检查权限
        if not self.permission_service.has_permission(dataset_id, user_id, PermissionLevel.EDITOR):
            return None

        db_metadata = self.get_metadata(dataset_id, user_id)
        if not db_metadata:
            return None

        # 更新字段
        for key, value in metadata.dict(exclude_unset=True).items():
            if key in ['source', 'quality']:
                setattr(db_metadata, key, value.dict())
            else:
                setattr(db_metadata, key, value)
        
        db_metadata.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(db_metadata)
        return db_metadata

    def delete_metadata(self, dataset_id: int, user_id: int) -> bool:
        """删除数据集元数据"""
        # 检查权限
        if not self.permission_service.has_permission(dataset_id, user_id, PermissionLevel.ADMIN):
            return False

        db_metadata = self.get_metadata(dataset_id, user_id)
        if not db_metadata:
            return False

        self.db.delete(db_metadata)
        self.db.commit()
        return True

    def update_quality_metrics(
        self,
        dataset_id: int,
        quality: DataQuality,
        user_id: int
    ) -> Optional[DatasetMetadata]:
        """更新数据质量指标"""
        # 检查权限
        if not self.permission_service.has_permission(dataset_id, user_id, PermissionLevel.EDITOR):
            return None

        db_metadata = self.get_metadata(dataset_id, user_id)
        if not db_metadata:
            return None

        db_metadata.quality = quality.dict()
        db_metadata.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(db_metadata)
        return db_metadata

    def update_statistics(
        self,
        dataset_id: int,
        statistics: Dict[str, Any],
        user_id: int
    ) -> Optional[DatasetMetadata]:
        """更新数据集统计信息"""
        # 检查权限
        if not self.permission_service.has_permission(dataset_id, user_id, PermissionLevel.EDITOR):
            return None

        db_metadata = self.get_metadata(dataset_id, user_id)
        if not db_metadata:
            return None

        db_metadata.statistics = statistics
        db_metadata.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(db_metadata)
        return db_metadata

    def search_metadata(
        self,
        user_id: int,
        keywords: Optional[List[str]] = None,
        data_level: Optional[DataLevel] = None,
        source_type: Optional[str] = None,
        min_quality: Optional[float] = None,
        skip: int = 0,
        limit: int = 10
    ) -> List[DatasetMetadata]:
        """搜索数据集元数据"""
        # 获取用户有权限的数据集ID列表
        permissions = self.permission_service.list_permissions(user_id)
        dataset_ids = [p.dataset_id for p in permissions]
        
        # 构建查询
        query = self.db.query(DatasetMetadata).filter(
            DatasetMetadata.dataset_id.in_(dataset_ids)
        )

        if keywords:
            for keyword in keywords:
                query = query.filter(
                    or_(
                        DatasetMetadata.title.ilike(f"%{keyword}%"),
                        DatasetMetadata.description.ilike(f"%{keyword}%"),
                        DatasetMetadata.keywords.contains([keyword])
                    )
                )

        if data_level:
            query = query.filter(DatasetMetadata.data_level == data_level)

        if source_type:
            query = query.filter(DatasetMetadata.source['type'].astext == source_type)

        if min_quality is not None:
            query = query.filter(
                or_(
                    DatasetMetadata.quality['completeness'].astext.cast(Float) >= min_quality,
                    DatasetMetadata.quality['accuracy'].astext.cast(Float) >= min_quality,
                    DatasetMetadata.quality['consistency'].astext.cast(Float) >= min_quality,
                    DatasetMetadata.quality['timeliness'].astext.cast(Float) >= min_quality,
                    DatasetMetadata.quality['validity'].astext.cast(Float) >= min_quality
                )
            )

        return query.offset(skip).limit(limit).all() 