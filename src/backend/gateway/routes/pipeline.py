from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import pandas as pd

from ...core.database import get_db
from ...core.auth import get_current_user
from ...services.data.pipeline import PipelineService
from ...services.data.storage import DataPipeline, DataValidationRule, DataTransform

router = APIRouter()

@router.post("/pipelines/", response_model=DataPipeline)
async def create_pipeline(
    pipeline: DataPipeline,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """创建数据处理管道"""
    pipeline_service = PipelineService(db)
    return pipeline_service.create_pipeline(pipeline, current_user.id)

@router.get("/pipelines/{pipeline_id}", response_model=DataPipeline)
async def get_pipeline(
    pipeline_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """获取数据处理管道"""
    pipeline_service = PipelineService(db)
    return pipeline_service.get_pipeline(pipeline_id, current_user.id)

@router.put("/pipelines/{pipeline_id}", response_model=DataPipeline)
async def update_pipeline(
    pipeline_id: int,
    pipeline: DataPipeline,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """更新数据处理管道"""
    pipeline_service = PipelineService(db)
    return pipeline_service.update_pipeline(pipeline_id, pipeline, current_user.id)

@router.delete("/pipelines/{pipeline_id}")
async def delete_pipeline(
    pipeline_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """删除数据处理管道"""
    pipeline_service = PipelineService(db)
    pipeline_service.delete_pipeline(pipeline_id, current_user.id)
    return {"message": "数据处理管道已删除"}

@router.post("/pipelines/{pipeline_id}/execute")
async def execute_pipeline(
    pipeline_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """执行数据处理管道"""
    pipeline_service = PipelineService(db)
    
    # 读取上传的文件
    if file.filename.endswith('.csv'):
        data = pd.read_csv(file.file)
    elif file.filename.endswith('.xlsx'):
        data = pd.read_excel(file.file)
    elif file.filename.endswith('.json'):
        data = pd.read_json(file.file)
    else:
        raise HTTPException(status_code=400, detail="不支持的文件格式")
        
    # 执行数据处理管道
    result = pipeline_service.execute_pipeline(pipeline_id, data, current_user.id)
    
    # 将结果转换为JSON格式
    return result.to_dict(orient='records') 