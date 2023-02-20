import { useEffect, ForwardRefRenderFunction, useImperativeHandle, forwardRef } from 'react';
import { Form, Input, Switch } from 'antd';
import type { FormProps } from 'antd';

import Tags from '@comps/Tags';
import { DISABLE_AUTO_COMPLETE } from '@/utils';

interface AwesomeFormProps {
  record?: Record<string | symbol, any> | null;
}

const initFormValue = {
  title: '',
  url: '',
  enable: true,
  tags: [],
  category: '',
};

const AwesomeForm: ForwardRefRenderFunction<FormProps, AwesomeFormProps> = ({ record }, ref) => {
  const [form] = Form.useForm();
  useImperativeHandle(ref, () => ({ form }));

  useEffect(() => {
    if (record) {
      form.setFieldsValue(record);
    }
  }, [record]);

  return (
    <Form form={form} labelCol={{ span: 4 }} initialValues={initFormValue}>
      <Form.Item label="标题" name="title" rules={[{ required: true, message: '请输入标题!' }]}>
        <Input placeholder="Please enter a title" {...DISABLE_AUTO_COMPLETE} />
      </Form.Item>
      <Form.Item
        label="URL"
        name="url"
        rules={[{ required: true, message: '请输入 URL' }, { type: 'url' }]}
      >
        <Input placeholder="请输入 URL" {...DISABLE_AUTO_COMPLETE} />
      </Form.Item>
      <Form.Item label="分类" name="category" rules={[{ required: true, message: '请输入分类' }]}>
        <Input placeholder="请输入分类" {...DISABLE_AUTO_COMPLETE} />
      </Form.Item>
      <Form.Item label="标签" name="tags">
        <Tags value={record?.tags} />
      </Form.Item>
      <Form.Item label="启用" name="enable" valuePropName="checked">
        <Switch />
      </Form.Item>
    </Form>
  );
};

export default forwardRef(AwesomeForm);
