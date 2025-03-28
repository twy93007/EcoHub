from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Response
from sqlalchemy.orm import Session

from ...services.data.models import DataTable, TablePreview, TableExport
from ...services.data.table import DataTableService
from ...services.data.import_service import DataTableImportService
from ...core.database import get_db
from ...core.auth import get_current_user

router = APIRouter()

@router.post("/datasets/{dataset_id}/tables/", response_model=DataTable)
async def create_table(
    dataset_id: int,
    table: DataTable,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """创建数据表"""
    try:
        table_service = DataTableService(db)
        return table_service.create_table(table, current_user["id"])
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/datasets/{dataset_id}/tables/", response_model=List[DataTable])
async def list_tables(
    dataset_id: int,
    skip: int = 0,
    limit: int = 100,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """列出数据集下的所有数据表"""
    try:
        table_service = DataTableService(db)
        return table_service.list_tables(dataset_id, current_user["id"], skip, limit)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))

@router.get("/tables/{table_id}/", response_model=DataTable)
async def get_table(
    table_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """获取数据表信息"""
    try:
        table_service = DataTableService(db)
        return table_service.get_table(table_id, current_user["id"])
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.put("/tables/{table_id}/", response_model=DataTable)
async def update_table(
    table_id: int,
    table: DataTable,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """更新数据表信息"""
    try:
        table_service = DataTableService(db)
        return table_service.update_table(table_id, table, current_user["id"])
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.delete("/tables/{table_id}/")
async def delete_table(
    table_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """删除数据表"""
    try:
        table_service = DataTableService(db)
        table_service.delete_table(table_id, current_user["id"])
        return {"message": "数据表已删除"}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/datasets/{dataset_id}/tables/import/csv/", response_model=DataTable)
async def import_csv(
    dataset_id: int,
    file: UploadFile = File(...),
    table_name: str = None,
    description: Optional[str] = None,
    is_public: bool = False,
    tags: List[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """从CSV文件导入数据表"""
    try:
        import_service = DataTableImportService(db)
        # 保存上传的文件
        file_path = f"uploads/{file.filename}"
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # 导入数据表
        return import_service.import_from_csv(
            file_path,
            dataset_id,
            table_name or file.filename,
            current_user["id"],
            description,
            is_public,
            tags
        )
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/datasets/{dataset_id}/tables/import/excel/", response_model=DataTable)
async def import_excel(
    dataset_id: int,
    file: UploadFile = File(...),
    table_name: str = None,
    sheet_name: Optional[str] = None,
    description: Optional[str] = None,
    is_public: bool = False,
    tags: List[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """从Excel文件导入数据表"""
    try:
        import_service = DataTableImportService(db)
        # 保存上传的文件
        file_path = f"uploads/{file.filename}"
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # 导入数据表
        return import_service.import_from_excel(
            file_path,
            dataset_id,
            table_name or file.filename,
            current_user["id"],
            sheet_name,
            description,
            is_public,
            tags
        )
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/datasets/{dataset_id}/tables/import/json/", response_model=DataTable)
async def import_json(
    dataset_id: int,
    file: UploadFile = File(...),
    table_name: str = None,
    description: Optional[str] = None,
    is_public: bool = False,
    tags: List[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """从JSON文件导入数据表"""
    try:
        import_service = DataTableImportService(db)
        # 保存上传的文件
        file_path = f"uploads/{file.filename}"
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # 导入数据表
        return import_service.import_from_json(
            file_path,
            dataset_id,
            table_name or file.filename,
            current_user["id"],
            description,
            is_public,
            tags
        )
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/tables/{table_id}/preview/", response_model=TablePreview)
async def preview_table(
    table_id: int,
    limit: int = 10,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """预览数据表数据"""
    try:
        table_service = DataTableService(db)
        return table_service.get_table_preview(table_id, current_user["id"], limit)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.post("/tables/{table_id}/export/")
async def export_table(
    table_id: int,
    export_config: TableExport,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """导出数据表"""
    try:
        table_service = DataTableService(db)
        file_path = table_service.export_table(
            table_id,
            export_config.dict(),
            current_user["id"]
        )
        
        # 读取文件并返回
        with open(file_path, "rb") as f:
            content = f.read()
            
        return Response(
            content=content,
            media_type="application/octet-stream",
            headers={
                "Content-Disposition": f"attachment; filename={file_path.split('/')[-1]}"
            }
        )
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e)) 