from typing import List, Dict, Any, Optional
import pandas as pd
from datetime import datetime
from sqlalchemy.orm import Session
import numpy as np
from scipy import stats

from .storage import DataValidationRule, DataTransform, DataPipeline
from .permission import DatasetPermissionService

class DataValidator:
    """数据验证器"""
    
    @staticmethod
    def validate_not_null(data: pd.Series) -> pd.Series:
        """验证非空"""
        return data.notna()
        
    @staticmethod
    def validate_unique(data: pd.Series) -> pd.Series:
        """验证唯一性"""
        return ~data.duplicated()
        
    @staticmethod
    def validate_range(data: pd.Series, min_val: float, max_val: float) -> pd.Series:
        """验证数值范围"""
        return (data >= min_val) & (data <= max_val)
        
    @staticmethod
    def validate_length(data: pd.Series, min_len: int, max_len: int) -> pd.Series:
        """验证字符串长度"""
        return (data.str.len() >= min_len) & (data.str.len() <= max_len)
        
    @staticmethod
    def validate_pattern(data: pd.Series, pattern: str) -> pd.Series:
        """验证正则表达式模式"""
        return data.str.match(pattern)
        
    @staticmethod
    def validate_custom(data: pd.Series, func: callable) -> pd.Series:
        """自定义验证"""
        return data.apply(func)

class DataTransformer:
    """数据转换器"""
    
    @staticmethod
    def transform_type(data: pd.Series, target_type: str) -> pd.Series:
        """类型转换"""
        if target_type == "int":
            return pd.to_numeric(data, errors="coerce").astype("Int64")
        elif target_type == "float":
            return pd.to_numeric(data, errors="coerce")
        elif target_type == "datetime":
            return pd.to_datetime(data, errors="coerce")
        elif target_type == "string":
            return data.astype(str)
        else:
            raise ValueError(f"不支持的转换类型: {target_type}")
            
    @staticmethod
    def transform_scale(data: pd.Series, method: str = "standard") -> pd.Series:
        """数据缩放"""
        if method == "standard":
            return (data - data.mean()) / data.std()
        elif method == "minmax":
            return (data - data.min()) / (data.max() - data.min())
        else:
            raise ValueError(f"不支持的缩放方法: {method}")
            
    @staticmethod
    def transform_bin(data: pd.Series, bins: int) -> pd.Series:
        """数据分箱"""
        return pd.qcut(data, q=bins, labels=False)
        
    @staticmethod
    def transform_aggregate(data: pd.Series, method: str) -> pd.Series:
        """数据聚合"""
        if method == "mean":
            return data.mean()
        elif method == "sum":
            return data.sum()
        elif method == "count":
            return data.count()
        else:
            raise ValueError(f"不支持的聚合方法: {method}")

class PipelineService:
    """数据处理管道服务"""
    
    def __init__(self, db: Session):
        self.db = db
        self.permission_service = DatasetPermissionService(db)
        self.validator = DataValidator()
        self.transformer = DataTransformer()
        
    def create_pipeline(self, pipeline: DataPipeline, user_id: int) -> DataPipeline:
        """创建数据处理管道"""
        # 检查用户权限
        if not self.permission_service.has_permission(pipeline.table_id, user_id, "EDITOR"):
            raise PermissionError("用户没有权限创建数据处理管道")
            
        self.db.add(pipeline)
        self.db.commit()
        self.db.refresh(pipeline)
        return pipeline
        
    def get_pipeline(self, pipeline_id: int, user_id: int) -> DataPipeline:
        """获取数据处理管道"""
        pipeline = self.db.query(DataPipeline).filter(DataPipeline.id == pipeline_id).first()
        if not pipeline:
            raise ValueError("数据处理管道不存在")
            
        # 检查用户权限
        if not self.permission_service.has_permission(pipeline.table_id, user_id, "VIEWER"):
            raise PermissionError("用户没有权限访问该数据处理管道")
            
        return pipeline
        
    def update_pipeline(self, pipeline_id: int, pipeline: DataPipeline, user_id: int) -> DataPipeline:
        """更新数据处理管道"""
        db_pipeline = self.get_pipeline(pipeline_id, user_id)
        
        # 检查用户权限
        if not self.permission_service.has_permission(db_pipeline.table_id, user_id, "EDITOR"):
            raise PermissionError("用户没有权限更新该数据处理管道")
            
        # 更新管道信息
        for field, value in pipeline.dict(exclude_unset=True).items():
            setattr(db_pipeline, field, value)
            
        db_pipeline.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(db_pipeline)
        return db_pipeline
        
    def delete_pipeline(self, pipeline_id: int, user_id: int) -> None:
        """删除数据处理管道"""
        pipeline = self.get_pipeline(pipeline_id, user_id)
        
        # 检查用户权限
        if not self.permission_service.has_permission(pipeline.table_id, user_id, "ADMIN"):
            raise PermissionError("用户没有权限删除该数据处理管道")
            
        self.db.delete(pipeline)
        self.db.commit()
        
    def execute_pipeline(self, pipeline_id: int, data: pd.DataFrame, user_id: int) -> pd.DataFrame:
        """执行数据处理管道"""
        pipeline = self.get_pipeline(pipeline_id, user_id)
        
        # 检查用户权限
        if not self.permission_service.has_permission(pipeline.table_id, user_id, "EDITOR"):
            raise PermissionError("用户没有权限执行该数据处理管道")
            
        result = data.copy()
        
        # 执行每个处理步骤
        for step in pipeline.steps:
            step_type = step.get("type")
            step_params = step.get("params", {})
            
            if step_type == "validate":
                # 执行数据验证
                rule = DataValidationRule(**step_params)
                validation_func = getattr(self.validator, f"validate_{rule.rule_type}")
                validation_result = validation_func(result[rule.column_name], **rule.rule_params)
                if not validation_result.all():
                    raise ValueError(f"数据验证失败: {rule.error_message}")
                    
            elif step_type == "transform":
                # 执行数据转换
                transform = DataTransform(**step_params)
                transform_func = getattr(self.transformer, f"transform_{transform.transform_type}")
                for source_col, target_col in zip(transform.source_columns, transform.target_columns):
                    result[target_col] = transform_func(result[source_col], **transform.transform_params)
                    
        return result 