import {
  useEffect,
  useState,
  ForwardRefRenderFunction,
  useImperativeHandle,
  forwardRef,
} from 'react';
import { Form, Input, Select, Tooltip } from 'antd';
import { v4 } from 'uuid';
import type { FormProps } from 'antd';

import { DISABLE_AUTO_COMPLETE, chatRoot } from '@/utils';
import useInit from '@/hooks/useInit';

interface SyncFormProps {
  record?: Record<string | symbol, any> | null;
  type: string;
}

const initFormValue = {
  act: '',
  enable: true,
  tags: [],
  prompt: '',
};

const SyncForm: ForwardRefRenderFunction<FormProps, SyncFormProps> = ({ record, type }, ref) => {
  const isDisabled = type === 'edit';
  const [form] = Form.useForm();
  useImperativeHandle(ref, () => ({ form }));
  const [root, setRoot] = useState('');

  useInit(async () => {
    setRoot(await chatRoot());
  });

  useEffect(() => {
    if (record) {
      form.setFieldsValue(record);
    }
  }, [record]);

  const pathOptions = (
    <Form.Item noStyle name="protocol" initialValue="https">
      <Select disabled={isDisabled}>
        <Select.Option value="local">{root}</Select.Option>
        <Select.Option value="http">http://</Select.Option>
        <Select.Option value="https">https://</Select.Option>
      </Select>
    </Form.Item>
  );
  const extOptions = (
    <Form.Item noStyle name="ext" initialValue="json">
      <Select disabled={isDisabled}>
        <Select.Option value="csv">.csv</Select.Option>
        <Select.Option value="json">.json</Select.Option>
      </Select>
    </Form.Item>
  );

  const jsonTip = (
    <Tooltip
      title={
        <pre>
          {JSON.stringify(
            [
              { cmd: '', act: '', prompt: '' },
              { cmd: '', act: '', prompt: '' },
            ],
            null,
            2,
          )}
        </pre>
      }
    >
      <a>JSON</a>
    </Tooltip>
  );

  const csvTip = (
    <Tooltip
      title={
        <pre>{`"cmd","act","prompt"
"cmd","act","prompt"
"cmd","act","prompt"
"cmd","act","prompt"`}</pre>
      }
    >
      <a>CSV</a>
    </Tooltip>
  );

  return (
    <>
      <Form form={form} labelCol={{ span: 4 }} initialValues={initFormValue}>
        <Form.Item label="名字" name="name" rules={[{ required: true, message: '请输入名字!' }]}>
          <Input placeholder="请输入名字" {...DISABLE_AUTO_COMPLETE} />
        </Form.Item>
        <Form.Item label="路径" name="path" rules={[{ required: true, message: '请输入路径!' }]}>
          <Input
            placeholder="你的路径"
            addonBefore={pathOptions}
            addonAfter={extOptions}
            {...DISABLE_AUTO_COMPLETE}
          />
        </Form.Item>
        <Form.Item style={{ display: 'none' }} name="id" initialValue={v4().replace(/-/g, '')}>
          <input />
        </Form.Item>
      </Form>
      <div className="tip">
        <p>
          只支持 {csvTip} 和 {jsonTip} 格式的文件.
        </p>
      </div>
    </>
  );
};

export default forwardRef(SyncForm);
