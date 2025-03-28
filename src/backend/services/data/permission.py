from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from .models import DatasetPermission, PermissionLevel

class DatasetPermissionService:
    def __init__(self, db: Session):
        self.db = db

    def get_permission(self, dataset_id: int, user_id: int) -> Optional[DatasetPermission]:
        """获取用户对数据集的权限"""
        return self.db.query(DatasetPermission).filter(
            and_(
                DatasetPermission.dataset_id == dataset_id,
                DatasetPermission.user_id == user_id
            )
        ).first()

    def get_permission_level(self, dataset_id: int, user_id: int) -> PermissionLevel:
        """获取用户对数据集的权限级别"""
        permission = self.get_permission(dataset_id, user_id)
        return permission.permission_level if permission else PermissionLevel.NONE

    def has_permission(self, dataset_id: int, user_id: int, required_level: PermissionLevel) -> bool:
        """检查用户是否具有指定级别的权限"""
        current_level = self.get_permission_level(dataset_id, user_id)
        return current_level.value >= required_level.value

    def grant_permission(
        self,
        dataset_id: int,
        user_id: int,
        permission_level: PermissionLevel
    ) -> DatasetPermission:
        """授予用户对数据集的权限"""
        permission = self.get_permission(dataset_id, user_id)
        if permission:
            permission.permission_level = permission_level
            permission.updated_at = datetime.utcnow()
        else:
            permission = DatasetPermission(
                dataset_id=dataset_id,
                user_id=user_id,
                permission_level=permission_level
            )
            self.db.add(permission)
        self.db.commit()
        self.db.refresh(permission)
        return permission

    def revoke_permission(self, dataset_id: int, user_id: int) -> bool:
        """撤销用户对数据集的权限"""
        permission = self.get_permission(dataset_id, user_id)
        if permission:
            self.db.delete(permission)
            self.db.commit()
            return True
        return False

    def list_permissions(self, dataset_id: int) -> List[DatasetPermission]:
        """获取数据集的所有权限设置"""
        return self.db.query(DatasetPermission).filter(
            DatasetPermission.dataset_id == dataset_id
        ).all()

    def is_owner(self, dataset_id: int, user_id: int) -> bool:
        """检查用户是否是数据集的所有者"""
        return self.get_permission_level(dataset_id, user_id) == PermissionLevel.OWNER

    def is_admin(self, dataset_id: int, user_id: int) -> bool:
        """检查用户是否是数据集的管理员"""
        return self.get_permission_level(dataset_id, user_id) == PermissionLevel.ADMIN

    def is_editor(self, dataset_id: int, user_id: int) -> bool:
        """检查用户是否是数据集的编辑者"""
        return self.get_permission_level(dataset_id, user_id) == PermissionLevel.EDITOR

    def is_viewer(self, dataset_id: int, user_id: int) -> bool:
        """检查用户是否是数据集的查看者"""
        return self.get_permission_level(dataset_id, user_id) == PermissionLevel.VIEWER 