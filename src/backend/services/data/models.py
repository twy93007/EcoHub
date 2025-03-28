from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from pydantic import BaseModel, Field
from enum import Enum

class PermissionLevel(str, Enum):
    """权限级别枚举"""
    OWNER = "owner"           # 所有者
    ADMIN = "admin"           # 管理员
    EDITOR = "editor"         # 编辑者
    VIEWER = "viewer"         # 查看者
    NONE = "none"            # 无权限

class DatasetPermission(BaseModel):
    """数据集权限模型"""
    id: Optional[int] = None
    dataset_id: int
    user_id: int
    permission_level: PermissionLevel
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class Dataset(BaseModel):
    """数据集模型"""
    id: Optional[int] = None
    name: str = Field(..., description="数据集名称")
    description: Optional[str] = Field(None, description="数据集描述")
    version: str = Field("1.0.0", description="数据集版本")
    owner_id: int = Field(..., description="数据集所有者ID")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_public: bool = Field(False, description="是否公开")
    tags: List[str] = Field(default_factory=list, description="数据集标签")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="数据集元数据")

class DatasetVersion(BaseModel):
    """数据集版本模型"""
    id: Optional[int] = None
    dataset_id: int = Field(..., description="关联的数据集ID")
    version: str = Field(..., description="版本号")
    description: Optional[str] = Field(None, description="版本描述")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: int = Field(..., description="创建者ID")
    file_path: str = Field(..., description="数据文件路径")
    file_size: int = Field(..., description="文件大小(字节)")
    checksum: str = Field(..., description="文件校验和")

class DataLevel(str, Enum):
    """数据层级枚举"""
    RAW = "raw"           # 原始数据
    PROCESSED = "processed"  # 处理后的数据
    AGGREGATED = "aggregated"  # 聚合数据
    DERIVED = "derived"    # 派生数据

class DataSource(BaseModel):
    """数据来源模型"""
    type: str = Field(..., description="来源类型")
    name: str = Field(..., description="来源名称")
    url: Optional[str] = Field(None, description="来源URL")
    description: Optional[str] = Field(None, description="来源描述")
    contact: Optional[str] = Field(None, description="联系人")
    license: Optional[str] = Field(None, description="许可证")

class DataQuality(BaseModel):
    """数据质量模型"""
    completeness: float = Field(..., ge=0, le=1, description="完整性")
    accuracy: float = Field(..., ge=0, le=1, description="准确性")
    consistency: float = Field(..., ge=0, le=1, description="一致性")
    timeliness: float = Field(..., ge=0, le=1, description="时效性")
    validity: float = Field(..., ge=0, le=1, description="有效性")

class DatasetMetadata(BaseModel):
    """数据集元数据模型"""
    id: Optional[int] = None
    dataset_id: int
    title: str = Field(..., description="数据集标题")
    description: str = Field(..., description="数据集描述")
    keywords: List[str] = Field(default_factory=list, description="关键词")
    data_level: DataLevel = Field(..., description="数据层级")
    source: DataSource = Field(..., description="数据来源")
    quality: DataQuality = Field(..., description="数据质量")
    schema: Dict[str, Any] = Field(default_factory=dict, description="数据模式")
    statistics: Dict[str, Any] = Field(default_factory=dict, description="统计信息")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class DataType(str, Enum):
    """数据类型枚举"""
    STRING = "string"
    INTEGER = "integer"
    FLOAT = "float"
    BOOLEAN = "boolean"
    DATE = "date"
    DATETIME = "datetime"
    JSON = "json"
    BLOB = "blob"

class ColumnMetadata(BaseModel):
    """列元数据模型"""
    name: str = Field(..., description="列名")
    type: DataType = Field(..., description="数据类型")
    description: Optional[str] = Field(None, description="列描述")
    is_primary_key: bool = Field(False, description="是否主键")
    is_nullable: bool = Field(True, description="是否可为空")
    default_value: Optional[Any] = Field(None, description="默认值")
    constraints: Dict[str, Any] = Field(default_factory=dict, description="约束条件")
    statistics: Dict[str, Any] = Field(default_factory=dict, description="统计信息")

class DataTable(BaseModel):
    """数据表模型"""
    id: Optional[int] = None
    dataset_id: int = Field(..., description="所属数据集ID")
    name: str = Field(..., description="表名")
    description: Optional[str] = Field(None, description="表描述")
    columns: List[ColumnMetadata] = Field(..., description="列定义")
    row_count: int = Field(0, description="行数")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: int = Field(..., description="创建者ID")
    is_public: bool = Field(False, description="是否公开")
    tags: List[str] = Field(default_factory=list, description="标签")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="表元数据")

class TablePreview(BaseModel):
    """数据表预览模型"""
    table_id: int
    columns: List[str]
    rows: List[List[Any]]
    total_rows: int
    preview_size: int = 10

class TableExport(BaseModel):
    """数据表导出配置"""
    format: str = Field(..., description="导出格式(csv/excel/json)")
    include_header: bool = Field(True, description="是否包含表头")
    encoding: str = Field("utf-8", description="文件编码")
    delimiter: str = Field(",", description="分隔符(CSV格式)")
    compression: bool = Field(False, description="是否压缩")
    selected_columns: Optional[List[str]] = Field(None, description="选中的列")
    filters: Optional[Dict[str, Any]] = Field(None, description="过滤条件")
    sort_by: Optional[List[Dict[str, str]]] = Field(None, description="排序条件") 