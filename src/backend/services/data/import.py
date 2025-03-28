from typing import List, Dict, Any, Optional
import pandas as pd
from sqlalchemy.orm import Session
from datetime import datetime

from .models import DataTable, ColumnMetadata, DataType
from .permission import DatasetPermissionService

class DataTableImportService:
    """数据表导入服务类"""
    
    def __init__(self, db: Session):
        self.db = db
        self.permission_service = DatasetPermissionService(db)
    
    def import_from_csv(self, file_path: str, dataset_id: int, 
                       table_name: str, user_id: int,
                       description: Optional[str] = None,
                       is_public: bool = False,
                       tags: List[str] = None) -> DataTable:
        """从CSV文件导入数据表
        
        Args:
            file_path: CSV文件路径
            dataset_id: 数据集ID
            table_name: 表名
            user_id: 用户ID
            description: 表描述
            is_public: 是否公开
            tags: 标签列表
            
        Returns:
            创建的数据表
        """
        # 检查用户是否有权限在该数据集下创建表
        if not self.permission_service.has_permission(dataset_id, user_id, "EDITOR"):
            raise PermissionError("用户没有权限在该数据集下创建表")
            
        # 读取CSV文件
        df = pd.read_csv(file_path)
        
        # 推断列类型
        columns = []
        for col_name, col_type in df.dtypes.items():
            data_type = self._infer_data_type(col_type)
            columns.append(ColumnMetadata(
                name=col_name,
                type=data_type,
                is_nullable=True
            ))
            
        # 创建数据表
        table = DataTable(
            dataset_id=dataset_id,
            name=table_name,
            description=description,
            columns=columns,
            created_by=user_id,
            is_public=is_public,
            tags=tags or [],
            row_count=len(df)
        )
        
        # TODO: 实现实际的数据导入逻辑
        # 这里需要根据实际的数据存储方式来实现
        
        return table
    
    def import_from_excel(self, file_path: str, dataset_id: int,
                         table_name: str, user_id: int,
                         sheet_name: Optional[str] = None,
                         description: Optional[str] = None,
                         is_public: bool = False,
                         tags: List[str] = None) -> DataTable:
        """从Excel文件导入数据表
        
        Args:
            file_path: Excel文件路径
            dataset_id: 数据集ID
            table_name: 表名
            user_id: 用户ID
            sheet_name: 工作表名称
            description: 表描述
            is_public: 是否公开
            tags: 标签列表
            
        Returns:
            创建的数据表
        """
        # 检查用户是否有权限在该数据集下创建表
        if not self.permission_service.has_permission(dataset_id, user_id, "EDITOR"):
            raise PermissionError("用户没有权限在该数据集下创建表")
            
        # 读取Excel文件
        df = pd.read_excel(file_path, sheet_name=sheet_name)
        
        # 推断列类型
        columns = []
        for col_name, col_type in df.dtypes.items():
            data_type = self._infer_data_type(col_type)
            columns.append(ColumnMetadata(
                name=col_name,
                type=data_type,
                is_nullable=True
            ))
            
        # 创建数据表
        table = DataTable(
            dataset_id=dataset_id,
            name=table_name,
            description=description,
            columns=columns,
            created_by=user_id,
            is_public=is_public,
            tags=tags or [],
            row_count=len(df)
        )
        
        # TODO: 实现实际的数据导入逻辑
        # 这里需要根据实际的数据存储方式来实现
        
        return table
    
    def import_from_json(self, file_path: str, dataset_id: int,
                        table_name: str, user_id: int,
                        description: Optional[str] = None,
                        is_public: bool = False,
                        tags: List[str] = None) -> DataTable:
        """从JSON文件导入数据表
        
        Args:
            file_path: JSON文件路径
            dataset_id: 数据集ID
            table_name: 表名
            user_id: 用户ID
            description: 表描述
            is_public: 是否公开
            tags: 标签列表
            
        Returns:
            创建的数据表
        """
        # 检查用户是否有权限在该数据集下创建表
        if not self.permission_service.has_permission(dataset_id, user_id, "EDITOR"):
            raise PermissionError("用户没有权限在该数据集下创建表")
            
        # 读取JSON文件
        df = pd.read_json(file_path)
        
        # 推断列类型
        columns = []
        for col_name, col_type in df.dtypes.items():
            data_type = self._infer_data_type(col_type)
            columns.append(ColumnMetadata(
                name=col_name,
                type=data_type,
                is_nullable=True
            ))
            
        # 创建数据表
        table = DataTable(
            dataset_id=dataset_id,
            name=table_name,
            description=description,
            columns=columns,
            created_by=user_id,
            is_public=is_public,
            tags=tags or [],
            row_count=len(df)
        )
        
        # TODO: 实现实际的数据导入逻辑
        # 这里需要根据实际的数据存储方式来实现
        
        return table
    
    def _infer_data_type(self, pandas_type: Any) -> DataType:
        """从pandas数据类型推断系统数据类型
        
        Args:
            pandas_type: pandas数据类型
            
        Returns:
            系统数据类型
        """
        type_str = str(pandas_type).lower()
        
        if "int" in type_str:
            return DataType.INTEGER
        elif "float" in type_str:
            return DataType.FLOAT
        elif "bool" in type_str:
            return DataType.BOOLEAN
        elif "datetime" in type_str:
            return DataType.DATETIME
        elif "date" in type_str:
            return DataType.DATE
        elif "object" in type_str:
            return DataType.STRING
        else:
            return DataType.STRING 