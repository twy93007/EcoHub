from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from .models import DataTable, ColumnMetadata
from .permission import DatasetPermissionService

class DataTableService:
    """数据表服务类"""
    
    def __init__(self, db: Session):
        self.db = db
        self.permission_service = DatasetPermissionService(db)
    
    def create_table(self, table: DataTable, user_id: int) -> DataTable:
        """创建数据表
        
        Args:
            table: 数据表信息
            user_id: 用户ID
            
        Returns:
            创建的数据表
        """
        # 检查用户是否有权限在该数据集下创建表
        if not self.permission_service.has_permission(table.dataset_id, user_id, "EDITOR"):
            raise PermissionError("用户没有权限在该数据集下创建表")
            
        # 创建数据表
        db_table = DataTable(
            dataset_id=table.dataset_id,
            name=table.name,
            description=table.description,
            columns=table.columns,
            created_by=user_id,
            is_public=table.is_public,
            tags=table.tags,
            metadata=table.metadata
        )
        
        self.db.add(db_table)
        self.db.commit()
        self.db.refresh(db_table)
        
        return db_table
    
    def get_table(self, table_id: int, user_id: int) -> DataTable:
        """获取数据表信息
        
        Args:
            table_id: 数据表ID
            user_id: 用户ID
            
        Returns:
            数据表信息
        """
        table = self.db.query(DataTable).filter(DataTable.id == table_id).first()
        if not table:
            raise ValueError("数据表不存在")
            
        # 检查用户是否有权限访问该表
        if not self.permission_service.has_permission(table.dataset_id, user_id, "VIEWER"):
            raise PermissionError("用户没有权限访问该数据表")
            
        return table
    
    def list_tables(self, dataset_id: int, user_id: int, 
                   skip: int = 0, limit: int = 100) -> List[DataTable]:
        """列出数据集下的所有数据表
        
        Args:
            dataset_id: 数据集ID
            user_id: 用户ID
            skip: 跳过记录数
            limit: 返回记录数
            
        Returns:
            数据表列表
        """
        # 检查用户是否有权限访问该数据集
        if not self.permission_service.has_permission(dataset_id, user_id, "VIEWER"):
            raise PermissionError("用户没有权限访问该数据集")
            
        tables = self.db.query(DataTable).filter(
            DataTable.dataset_id == dataset_id
        ).offset(skip).limit(limit).all()
        
        return tables
    
    def update_table(self, table_id: int, table: DataTable, user_id: int) -> DataTable:
        """更新数据表信息
        
        Args:
            table_id: 数据表ID
            table: 更新的数据表信息
            user_id: 用户ID
            
        Returns:
            更新后的数据表
        """
        db_table = self.get_table(table_id, user_id)
        
        # 检查用户是否有权限编辑该表
        if not self.permission_service.has_permission(db_table.dataset_id, user_id, "EDITOR"):
            raise PermissionError("用户没有权限编辑该数据表")
            
        # 更新表信息
        for field, value in table.dict(exclude_unset=True).items():
            setattr(db_table, field, value)
            
        db_table.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(db_table)
        
        return db_table
    
    def delete_table(self, table_id: int, user_id: int) -> None:
        """删除数据表
        
        Args:
            table_id: 数据表ID
            user_id: 用户ID
        """
        db_table = self.get_table(table_id, user_id)
        
        # 检查用户是否有权限删除该表
        if not self.permission_service.has_permission(db_table.dataset_id, user_id, "ADMIN"):
            raise PermissionError("用户没有权限删除该数据表")
            
        self.db.delete(db_table)
        self.db.commit()
    
    def get_table_preview(self, table_id: int, user_id: int, 
                         limit: int = 10) -> Dict[str, Any]:
        """获取数据表预览数据
        
        Args:
            table_id: 数据表ID
            user_id: 用户ID
            limit: 预览行数
            
        Returns:
            预览数据
        """
        table = self.get_table(table_id, user_id)
        
        # TODO: 实现实际的数据预览逻辑
        # 这里需要根据实际的数据存储方式来实现
        preview_data = {
            "table_id": table_id,
            "columns": [col.name for col in table.columns],
            "rows": [],  # 实际数据行
            "total_rows": table.row_count,
            "preview_size": limit
        }
        
        return preview_data
    
    def export_table(self, table_id: int, export_config: Dict[str, Any], 
                    user_id: int) -> str:
        """导出数据表
        
        Args:
            table_id: 数据表ID
            export_config: 导出配置
            user_id: 用户ID
            
        Returns:
            导出文件路径
        """
        table = self.get_table(table_id, user_id)
        
        # 检查用户是否有权限导出该表
        if not self.permission_service.has_permission(table.dataset_id, user_id, "VIEWER"):
            raise PermissionError("用户没有权限导出该数据表")
            
        # TODO: 实现实际的数据导出逻辑
        # 这里需要根据实际的数据存储方式和导出格式来实现
        export_path = f"exports/table_{table_id}_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        
        return export_path 