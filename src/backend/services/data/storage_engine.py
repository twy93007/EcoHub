from typing import List, Dict, Any, Optional, Union
import os
import pandas as pd
import hashlib
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
import boto3
from botocore.exceptions import ClientError

from .storage import StorageType, StorageConfig, DataBlock
from .permission import DatasetPermissionService

class StorageEngine:
    """存储引擎基类"""
    
    def __init__(self, config: StorageConfig):
        self.config = config
        
    def save_block(self, block: DataBlock, data: pd.DataFrame) -> None:
        """保存数据块"""
        raise NotImplementedError
        
    def load_block(self, block: DataBlock) -> pd.DataFrame:
        """加载数据块"""
        raise NotImplementedError
        
    def delete_block(self, block: DataBlock) -> None:
        """删除数据块"""
        raise NotImplementedError
        
    def calculate_checksum(self, data: pd.DataFrame) -> str:
        """计算数据校验和"""
        return hashlib.sha256(data.to_csv().encode()).hexdigest()

class FileStorageEngine(StorageEngine):
    """文件存储引擎"""
    
    def __init__(self, config: StorageConfig):
        super().__init__(config)
        self.base_path = config.path or "data/storage"
        os.makedirs(self.base_path, exist_ok=True)
        
    def save_block(self, block: DataBlock, data: pd.DataFrame) -> None:
        """保存数据块到文件"""
        file_path = os.path.join(self.base_path, f"block_{block.id}.parquet")
        data.to_parquet(file_path)
        block.file_path = file_path
        block.checksum = self.calculate_checksum(data)
        
    def load_block(self, block: DataBlock) -> pd.DataFrame:
        """从文件加载数据块"""
        if not block.file_path or not os.path.exists(block.file_path):
            raise FileNotFoundError(f"数据块文件不存在: {block.file_path}")
        return pd.read_parquet(block.file_path)
        
    def delete_block(self, block: DataBlock) -> None:
        """删除数据块文件"""
        if block.file_path and os.path.exists(block.file_path):
            os.remove(block.file_path)

class DatabaseStorageEngine(StorageEngine):
    """数据库存储引擎"""
    
    def __init__(self, config: StorageConfig):
        super().__init__(config)
        self.engine = create_engine(config.connection_string)
        
    def save_block(self, block: DataBlock, data: pd.DataFrame) -> None:
        """保存数据块到数据库"""
        table_name = f"block_{block.id}"
        data.to_sql(table_name, self.engine, if_exists="replace", index=False)
        block.checksum = self.calculate_checksum(data)
        
    def load_block(self, block: DataBlock) -> pd.DataFrame:
        """从数据库加载数据块"""
        table_name = f"block_{block.id}"
        return pd.read_sql(f"SELECT * FROM {table_name}", self.engine)
        
    def delete_block(self, block: DataBlock) -> None:
        """从数据库删除数据块"""
        table_name = f"block_{block.id}"
        with self.engine.connect() as conn:
            conn.execute(f"DROP TABLE IF EXISTS {table_name}")

class CloudStorageEngine(StorageEngine):
    """云存储引擎"""
    
    def __init__(self, config: StorageConfig):
        super().__init__(config)
        self.s3_client = boto3.client(
            "s3",
            aws_access_key_id=config.credentials.get("access_key"),
            aws_secret_access_key=config.credentials.get("secret_key"),
            region_name=config.credentials.get("region")
        )
        self.bucket = config.credentials.get("bucket")
        
    def save_block(self, block: DataBlock, data: pd.DataFrame) -> None:
        """保存数据块到云存储"""
        key = f"blocks/block_{block.id}.parquet"
        data.to_parquet("/tmp/temp.parquet")
        
        try:
            self.s3_client.upload_file("/tmp/temp.parquet", self.bucket, key)
            block.file_path = key
            block.checksum = self.calculate_checksum(data)
        finally:
            os.remove("/tmp/temp.parquet")
            
    def load_block(self, block: DataBlock) -> pd.DataFrame:
        """从云存储加载数据块"""
        if not block.file_path:
            raise ValueError("数据块文件路径未设置")
            
        try:
            self.s3_client.download_file(self.bucket, block.file_path, "/tmp/temp.parquet")
            return pd.read_parquet("/tmp/temp.parquet")
        finally:
            if os.path.exists("/tmp/temp.parquet"):
                os.remove("/tmp/temp.parquet")
                
    def delete_block(self, block: DataBlock) -> None:
        """从云存储删除数据块"""
        if block.file_path:
            try:
                self.s3_client.delete_object(Bucket=self.bucket, Key=block.file_path)
            except ClientError:
                pass

class StorageEngineFactory:
    """存储引擎工厂类"""
    
    @staticmethod
    def create_engine(config: StorageConfig) -> StorageEngine:
        """创建存储引擎实例"""
        if config.type == StorageType.FILE:
            return FileStorageEngine(config)
        elif config.type == StorageType.DATABASE:
            return DatabaseStorageEngine(config)
        elif config.type == StorageType.CLOUD:
            return CloudStorageEngine(config)
        else:
            raise ValueError(f"不支持的存储类型: {config.type}") 