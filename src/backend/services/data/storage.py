import os
import hashlib
from typing import Optional, List, Dict, Any, Union
from fastapi import UploadFile
from datetime import datetime
from pydantic import BaseModel, Field
from enum import Enum

class StorageType(str, Enum):
    """存储类型枚举"""
    FILE = "file"           # 文件存储
    DATABASE = "database"   # 数据库存储
    CLOUD = "cloud"         # 云存储

class StorageConfig(BaseModel):
    """存储配置模型"""
    type: StorageType = Field(..., description="存储类型")
    path: Optional[str] = Field(None, description="存储路径")
    connection_string: Optional[str] = Field(None, description="连接字符串")
    credentials: Optional[Dict[str, Any]] = Field(None, description="认证信息")
    options: Dict[str, Any] = Field(default_factory=dict, description="其他配置选项")

class DataBlock(BaseModel):
    """数据块模型"""
    id: Optional[int] = None
    table_id: int = Field(..., description="所属数据表ID")
    block_index: int = Field(..., description="块索引")
    start_row: int = Field(..., description="起始行号")
    end_row: int = Field(..., description="结束行号")
    row_count: int = Field(..., description="行数")
    file_path: Optional[str] = Field(None, description="文件路径")
    checksum: str = Field(..., description="数据校验和")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class DataValidationRule(BaseModel):
    """数据验证规则模型"""
    id: Optional[int] = None
    table_id: int = Field(..., description="所属数据表ID")
    column_name: str = Field(..., description="列名")
    rule_type: str = Field(..., description="规则类型")
    rule_params: Dict[str, Any] = Field(..., description="规则参数")
    error_message: str = Field(..., description="错误信息")
    is_active: bool = Field(True, description="是否启用")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class DataTransform(BaseModel):
    """数据转换模型"""
    id: Optional[int] = None
    table_id: int = Field(..., description="所属数据表ID")
    name: str = Field(..., description="转换名称")
    description: Optional[str] = Field(None, description="转换描述")
    transform_type: str = Field(..., description="转换类型")
    transform_params: Dict[str, Any] = Field(..., description="转换参数")
    source_columns: List[str] = Field(..., description="源列名")
    target_columns: List[str] = Field(..., description="目标列名")
    is_active: bool = Field(True, description="是否启用")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class DataPipeline(BaseModel):
    """数据处理管道模型"""
    id: Optional[int] = None
    name: str = Field(..., description="管道名称")
    description: Optional[str] = Field(None, description="管道描述")
    table_id: int = Field(..., description="所属数据表ID")
    steps: List[Dict[str, Any]] = Field(..., description="处理步骤")
    schedule: Optional[Dict[str, Any]] = Field(None, description="调度配置")
    is_active: bool = Field(True, description="是否启用")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class FileStorage:
    def __init__(self, base_path: str = "data/datasets"):
        """初始化文件存储服务
        
        Args:
            base_path: 文件存储的基础路径
        """
        self.base_path = base_path
        os.makedirs(base_path, exist_ok=True)

    def _get_file_path(self, dataset_id: int, version: str, filename: str) -> str:
        """获取文件存储路径
        
        Args:
            dataset_id: 数据集ID
            version: 版本号
            filename: 文件名
            
        Returns:
            完整的文件存储路径
        """
        # 创建数据集目录
        dataset_dir = os.path.join(self.base_path, str(dataset_id))
        os.makedirs(dataset_dir, exist_ok=True)
        
        # 创建版本目录
        version_dir = os.path.join(dataset_dir, version)
        os.makedirs(version_dir, exist_ok=True)
        
        return os.path.join(version_dir, filename)

    def _calculate_checksum(self, file_path: str) -> str:
        """计算文件的SHA-256校验和
        
        Args:
            file_path: 文件路径
            
        Returns:
            文件的SHA-256校验和
        """
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    async def save_file(
        self,
        file: UploadFile,
        dataset_id: int,
        version: str
    ) -> tuple[str, int, str]:
        """保存上传的文件
        
        Args:
            file: 上传的文件
            dataset_id: 数据集ID
            version: 版本号
            
        Returns:
            tuple: (文件路径, 文件大小, 校验和)
        """
        # 生成安全的文件名
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        safe_filename = f"{timestamp}_{file.filename}"
        
        # 获取文件存储路径
        file_path = self._get_file_path(dataset_id, version, safe_filename)
        
        # 保存文件
        file_size = 0
        with open(file_path, "wb") as buffer:
            while chunk := await file.read(8192):
                file_size += len(chunk)
                buffer.write(chunk)
        
        # 计算校验和
        checksum = self._calculate_checksum(file_path)
        
        return file_path, file_size, checksum

    def get_file(self, dataset_id: int, version: str, filename: str) -> Optional[str]:
        """获取文件路径
        
        Args:
            dataset_id: 数据集ID
            version: 版本号
            filename: 文件名
            
        Returns:
            文件路径，如果文件不存在则返回None
        """
        file_path = self._get_file_path(dataset_id, version, filename)
        if os.path.exists(file_path):
            return file_path
        return None

    def delete_file(self, dataset_id: int, version: str, filename: str) -> bool:
        """删除文件
        
        Args:
            dataset_id: 数据集ID
            version: 版本号
            filename: 文件名
            
        Returns:
            是否删除成功
        """
        file_path = self._get_file_path(dataset_id, version, filename)
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False

    def delete_dataset_files(self, dataset_id: int) -> bool:
        """删除数据集的所有文件
        
        Args:
            dataset_id: 数据集ID
            
        Returns:
            是否删除成功
        """
        dataset_dir = os.path.join(self.base_path, str(dataset_id))
        if os.path.exists(dataset_dir):
            import shutil
            shutil.rmtree(dataset_dir)
            return True
        return False 