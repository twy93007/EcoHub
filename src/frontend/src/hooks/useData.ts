import { useState, useCallback } from 'react';
import { message } from 'antd';
import axios from 'axios';
import {
  DataSet,
  DataTable,
  PreviewConfig,
  PreviewResult,
  ExportConfig,
  ImportConfig,
  TableStats,
  DatasetStats,
} from '../types/data';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api/v1';

export const useData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = (error: any) => {
    console.error('API Error:', error);
    message.error(error.message || '操作失败');
    return Promise.reject(error);
  };

  const fetchDatasets = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/datasets`);
      if (!response.ok) throw new Error('获取数据集列表失败');
      const data = await response.json();
      return data as DataSet[];
    } catch (error) {
      return handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataset = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/datasets/${id}`);
      if (!response.ok) throw new Error('获取数据集详情失败');
      const data = await response.json();
      return data as DataSet;
    } catch (error) {
      return handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const createDataset = async (data: Partial<DataSet> & { files?: File[] }) => {
    setLoading(true);
    try {
      // 首先创建数据集
      const { files, ...datasetData } = data;
      const response = await fetch(`${API_BASE_URL}/datasets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datasetData),
      });

      if (!response.ok) throw new Error('创建数据集失败');
      const dataset = await response.json() as DataSet;

      // 如果有文件，上传文件并创建数据表
      if (files && files.length > 0) {
        await Promise.all(files.map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          
          const uploadResponse = await fetch(
            `${API_BASE_URL}/datasets/${dataset.id}/tables/import/${getFileType(file)}`,
            {
              method: 'POST',
              body: formData,
            }
          );

          if (!uploadResponse.ok) throw new Error(`上传文件 ${file.name} 失败`);
        }));
      }

      message.success('创建数据集成功');
      return dataset;
    } catch (error) {
      return handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const updateDataset = async (id: string, data: Partial<DataSet>) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/datasets/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('更新数据集失败');
      const updatedDataset = await response.json();
      message.success('更新数据集成功');
      return updatedDataset as DataSet;
    } catch (error) {
      return handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDataset = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/datasets/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('删除数据集失败');
      message.success('删除数据集成功');
    } catch (error) {
      return handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataTables = async (datasetId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/datasets/${datasetId}/tables`);
      if (!response.ok) throw new Error('获取数据表列表失败');
      const data = await response.json();
      return data as DataTable[];
    } catch (error) {
      return handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDataTable = async (tableId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tables/${tableId}`);
      if (!response.ok) throw new Error('获取数据表详情失败');
      const data = await response.json();
      return data as DataTable;
    } catch (error) {
      return handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const getFileType = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'csv':
        return 'csv';
      case 'xlsx':
      case 'xls':
        return 'excel';
      case 'json':
        return 'json';
      default:
        throw new Error('不支持的文件类型');
    }
  };

  // 数据表相关操作
  const createTable = useCallback(async (datasetId: number, data: Partial<DataTable>): Promise<DataTable> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/datasets/${datasetId}/tables/`, data);
      message.success('创建数据表成功');
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建数据表失败');
      message.error('创建数据表失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTable = useCallback(async (id: number): Promise<DataTable> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/tables/${id}/`);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据表失败');
      message.error('获取数据表失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateTable = useCallback(async (id: number, data: Partial<DataTable>): Promise<DataTable> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.put(`${API_BASE_URL}/tables/${id}/`, data);
      message.success('更新数据表成功');
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新数据表失败');
      message.error('更新数据表失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteTable = useCallback(async (id: number): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await axios.delete(`${API_BASE_URL}/tables/${id}/`);
      message.success('删除数据表成功');
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除数据表失败');
      message.error('删除数据表失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const listTables = useCallback(async (datasetId: number, params?: {
    page?: number;
    page_size?: number;
    search?: string;
  }): Promise<{ total: number; items: DataTable[] }> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/datasets/${datasetId}/tables/`, { params });
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据表列表失败');
      message.error('获取数据表列表失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 数据预览
  const previewTable = useCallback(async (id: number, config: PreviewConfig): Promise<PreviewResult> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/tables/${id}/preview/`, { params: config });
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据预览失败');
      message.error('获取数据预览失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 数据导入
  const importTable = useCallback(async (datasetId: number, file: File, config: ImportConfig): Promise<DataTable> => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('config', JSON.stringify(config));
      const response = await axios.post(`${API_BASE_URL}/datasets/${datasetId}/tables/import/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('导入数据表成功');
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入数据表失败');
      message.error('导入数据表失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 数据导出
  const exportTable = useCallback(async (id: number, config: ExportConfig): Promise<Blob> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/tables/${id}/export/`, config, {
        responseType: 'blob',
      });
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '导出数据表失败');
      message.error('导出数据表失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取统计信息
  const getTableStats = useCallback(async (id: number): Promise<TableStats> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/tables/${id}/stats/`);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据表统计信息失败');
      message.error('获取数据表统计信息失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDatasetStats = useCallback(async (id: number): Promise<DatasetStats> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/datasets/${id}/stats/`);
      return response.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据集统计信息失败');
      message.error('获取数据集统计信息失败');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchDatasets,
    fetchDataset,
    createDataset,
    updateDataset,
    deleteDataset,
    fetchDataTables,
    fetchDataTable,
    createTable,
    getTable,
    updateTable,
    deleteTable,
    listTables,
    previewTable,
    importTable,
    exportTable,
    getTableStats,
    getDatasetStats,
  };
}; 