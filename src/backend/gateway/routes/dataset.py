from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Response
from sqlalchemy.orm import Session
import os

from ..auth.auth import get_current_user
from ..auth.models import User
from ..database import get_db
from ...services.data.models import Dataset, DatasetVersion, PermissionLevel, DatasetPermission
from ...services.data.service import DatasetService

router = APIRouter()

@router.post("/datasets/", response_model=Dataset)
async def create_dataset(
    dataset: Dataset,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建新数据集"""
    service = DatasetService(db)
    return service.create_dataset(dataset, current_user.id)

@router.get("/datasets/", response_model=List[Dataset])
async def list_datasets(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    tags: Optional[List[str]] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取数据集列表"""
    service = DatasetService(db)
    return service.list_datasets(current_user.id, skip, limit, search, tags)

@router.get("/datasets/{dataset_id}", response_model=Dataset)
async def get_dataset(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取数据集详情"""
    service = DatasetService(db)
    dataset = service.get_dataset(dataset_id, current_user.id)
    if not dataset:
        raise HTTPException(status_code=404, detail="数据集不存在")
    return dataset

@router.put("/datasets/{dataset_id}", response_model=Dataset)
async def update_dataset(
    dataset_id: int,
    dataset: Dataset,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新数据集"""
    service = DatasetService(db)
    updated_dataset = service.update_dataset(dataset_id, dataset, current_user.id)
    if not updated_dataset:
        raise HTTPException(status_code=404, detail="数据集不存在或无权限修改")
    return updated_dataset

@router.delete("/datasets/{dataset_id}")
async def delete_dataset(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除数据集"""
    service = DatasetService(db)
    if not service.delete_dataset(dataset_id, current_user.id):
        raise HTTPException(status_code=404, detail="数据集不存在或无权限删除")
    return {"message": "数据集已删除"}

@router.post("/datasets/{dataset_id}/versions/", response_model=DatasetVersion)
async def create_version(
    dataset_id: int,
    version: DatasetVersion,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建数据集新版本"""
    service = DatasetService(db)
    new_version = await service.create_version(dataset_id, version, file, current_user.id)
    if not new_version:
        raise HTTPException(status_code=404, detail="数据集不存在或无权限修改")
    return new_version

@router.get("/datasets/{dataset_id}/versions/", response_model=List[DatasetVersion])
async def list_versions(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取数据集版本列表"""
    service = DatasetService(db)
    return service.list_versions(dataset_id, current_user.id)

@router.get("/datasets/{dataset_id}/versions/{version}", response_model=DatasetVersion)
async def get_version(
    dataset_id: int,
    version: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取数据集版本详情"""
    service = DatasetService(db)
    version_info = service.get_version(dataset_id, version, current_user.id)
    if not version_info:
        raise HTTPException(status_code=404, detail="版本不存在")
    return version_info

@router.get("/datasets/{dataset_id}/versions/{version}/download")
async def download_version(
    dataset_id: int,
    version: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """下载数据集版本文件"""
    service = DatasetService(db)
    file_path = service.get_version_file(dataset_id, version, current_user.id)
    if not file_path:
        raise HTTPException(status_code=404, detail="文件不存在")
    
    version_info = service.get_version(dataset_id, version, current_user.id)
    filename = os.path.basename(version_info.file_path)
    
    return Response(
        content=open(file_path, "rb").read(),
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )

@router.post("/datasets/{dataset_id}/permissions/", response_model=DatasetPermission)
async def grant_permission(
    dataset_id: int,
    target_user_id: int,
    permission_level: PermissionLevel,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """授予用户对数据集的权限"""
    service = DatasetService(db)
    if not service.grant_permission(dataset_id, target_user_id, permission_level, current_user.id):
        raise HTTPException(
            status_code=403,
            detail="无权限执行此操作或目标用户权限级别过高"
        )
    return service.permission_service.get_permission(dataset_id, target_user_id)

@router.delete("/datasets/{dataset_id}/permissions/{user_id}")
async def revoke_permission(
    dataset_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """撤销用户对数据集的权限"""
    service = DatasetService(db)
    if not service.revoke_permission(dataset_id, user_id, current_user.id):
        raise HTTPException(
            status_code=403,
            detail="无权限执行此操作或目标用户是所有者"
        )
    return {"message": "权限已撤销"}

@router.get("/datasets/{dataset_id}/permissions/", response_model=List[DatasetPermission])
async def list_permissions(
    dataset_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取数据集的所有权限设置"""
    service = DatasetService(db)
    # 检查权限
    if not service.permission_service.has_permission(dataset_id, current_user.id, PermissionLevel.ADMIN):
        raise HTTPException(status_code=403, detail="无权限查看权限设置")
    return service.permission_service.list_permissions(dataset_id) 