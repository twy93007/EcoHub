import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Steps,
  Card,
  Form,
  Input,
  Select,
  Upload,
  Button,
  message,
  Space,
  Divider,
  Typography
} from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useData } from '../../hooks/useData';
import { DataSet } from '../../types/data';

const { Step } = Steps;
const { Dragger } = Upload;
const { Title, Paragraph } = Typography;

const DataSetCreateWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { createDataset } = useData();
  const [fileList, setFileList] = useState<any[]>([]);

  const steps = [
    {
      title: '基本信息',
      content: (
        <Form
          form={form}
          layout="vertical"
          className="max-w-2xl mx-auto"
        >
          <Title level={4}>数据集基本信息</Title>
          <Paragraph className="mb-6">
            请填写数据集的基本信息，这些信息将帮助其他用户更好地理解和使用您的数据。
          </Paragraph>
          
          <Form.Item
            name="name"
            label="数据集名称"
            rules={[{ required: true, message: '请输入数据集名称' }]}
          >
            <Input placeholder="例如：中国经济发展指标数据集" />
          </Form.Item>

          <Form.Item
            name="description"
            label="描述"
            rules={[{ required: true, message: '请输入数据集描述' }]}
          >
            <Input.TextArea 
              rows={4}
              placeholder="请详细描述数据集的内容、用途和特点"
            />
          </Form.Item>

          <Form.Item
            name="data_level"
            label="数据层级"
            rules={[{ required: true, message: '请选择数据层级' }]}
          >
            <Select>
              <Select.Option value="raw">原始数据</Select.Option>
              <Select.Option value="processed">处理后数据</Select.Option>
              <Select.Option value="derived">衍生数据</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="source_type"
            label="数据来源"
            rules={[{ required: true, message: '请选择数据来源' }]}
          >
            <Select>
              <Select.Option value="manual">手动上传</Select.Option>
              <Select.Option value="api">API导入</Select.Option>
              <Select.Option value="automated">自动采集</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="tags"
            label="标签"
            rules={[{ required: true, message: '请至少添加一个标签' }]}
          >
            <Select
              mode="tags"
              placeholder="输入标签并按回车添加"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="is_public"
            label="访问权限"
            rules={[{ required: true, message: '请选择访问权限' }]}
          >
            <Select>
              <Select.Option value={true}>公开</Select.Option>
              <Select.Option value={false}>私有</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      ),
    },
    {
      title: '上传数据',
      content: (
        <div className="max-w-2xl mx-auto">
          <Title level={4}>上传数据文件</Title>
          <Paragraph className="mb-6">
            支持上传CSV、Excel、JSON等格式的数据文件。您可以一次上传多个文件，每个文件将被创建为一个数据表。
          </Paragraph>

          <Dragger
            multiple
            fileList={fileList}
            onChange={({ fileList }) => setFileList(fileList)}
            beforeUpload={() => false}
            accept=".csv,.xlsx,.xls,.json"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
            <p className="ant-upload-hint">
              支持单个或批量上传，支持 .csv、.xlsx、.json 等格式
            </p>
          </Dragger>

          <Divider />

          <div className="bg-gray-50 p-4 rounded">
            <Title level={5}>上传说明</Title>
            <ul className="list-disc pl-5 space-y-2">
              <li>文件大小限制：单个文件最大 500MB</li>
              <li>支持的文件格式：CSV、Excel (xlsx/xls)、JSON</li>
              <li>建议上传前检查数据格式是否规范</li>
              <li>对于大文件，上传可能需要较长时间，请耐心等待</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      title: '确认信息',
      content: (
        <div className="max-w-2xl mx-auto">
          <Title level={4}>确认创建信息</Title>
          <Paragraph className="mb-6">
            请确认以下信息无误，确认后将创建数据集。
          </Paragraph>

          <Card className="mb-6">
            <div className="space-y-4">
              <div>
                <div className="text-gray-500">数据集名称</div>
                <div className="font-medium">{form.getFieldValue('name')}</div>
              </div>
              <div>
                <div className="text-gray-500">描述</div>
                <div className="font-medium">{form.getFieldValue('description')}</div>
              </div>
              <div>
                <div className="text-gray-500">数据层级</div>
                <div className="font-medium">
                  {form.getFieldValue('data_level') === 'raw' && '原始数据'}
                  {form.getFieldValue('data_level') === 'processed' && '处理后数据'}
                  {form.getFieldValue('data_level') === 'derived' && '衍生数据'}
                </div>
              </div>
              <div>
                <div className="text-gray-500">数据来源</div>
                <div className="font-medium">
                  {form.getFieldValue('source_type') === 'manual' && '手动上传'}
                  {form.getFieldValue('source_type') === 'api' && 'API导入'}
                  {form.getFieldValue('source_type') === 'automated' && '自动采集'}
                </div>
              </div>
              <div>
                <div className="text-gray-500">标签</div>
                <div>
                  {form.getFieldValue('tags')?.map((tag: string) => (
                    <span key={tag} className="mr-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {tag}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-gray-500">访问权限</div>
                <div className="font-medium">
                  {form.getFieldValue('is_public') ? '公开' : '私有'}
                </div>
              </div>
              <div>
                <div className="text-gray-500">上传文件</div>
                <div>
                  {fileList.map(file => (
                    <div key={file.uid} className="flex items-center space-x-2">
                      <span>{file.name}</span>
                      <span className="text-gray-400">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </div>
      ),
    },
  ];

  const handleNext = async () => {
    if (currentStep === 0) {
      try {
        await form.validateFields();
        setCurrentStep(currentStep + 1);
      } catch (error) {
        message.error('请填写所有必填字段');
      }
    } else if (currentStep === 1) {
      if (fileList.length === 0) {
        message.warning('请至少上传一个文件');
        return;
      }
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleFinish = async () => {
    try {
      const values = await form.validateFields();
      const dataset = await createDataset({
        ...values,
        files: fileList.map(file => file.originFileObj),
      });
      message.success('创建数据集成功');
      navigate(`/datasets/${dataset.id}`);
    } catch (error) {
      message.error('创建数据集失败');
    }
  };

  return (
    <div className="p-6">
      <Card>
        <Steps current={currentStep} className="mb-8">
          {steps.map(item => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>

        <div className="min-h-[400px]">
          {steps[currentStep].content}
        </div>

        <div className="mt-8 flex justify-end space-x-4">
          {currentStep > 0 && (
            <Button onClick={handlePrev}>上一步</Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={handleNext}>
              下一步
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button type="primary" onClick={handleFinish}>
              完成
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default DataSetCreateWizard; 