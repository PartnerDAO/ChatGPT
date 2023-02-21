import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form, Tabs, Space, Button, Popconfirm, message } from 'antd';
import { invoke, dialog, process, path, shell } from '@tauri-apps/api';
import { clone, omit, isEqual } from 'lodash';

import useInit from '@/hooks/useInit';
import FilePath from '@/components/FilePath';
import { chatRoot, APP_CONF_JSON } from '@/utils';
import General from './General';
import MainWindow from './MainWindow';
import TrayWindow from './TrayWindow';

export default function Settings() {
  const [params] = useSearchParams();
  const [activeKey, setActiveKey] = useState('general');
  const [form] = Form.useForm();
  const [chatConf, setChatConf] = useState<any>(null);
  const [filePath, setPath] = useState('');
  const key = params.get('type');

  useEffect(() => {
    setActiveKey(key ? key : 'general');
  }, [key]);

  useInit(async () => {
    setChatConf(await invoke('get_app_conf'));
    setPath(await path.join(await chatRoot(), APP_CONF_JSON));
  });

  useEffect(() => {
    form.setFieldsValue(clone(chatConf));
  }, [chatConf]);

  const onCancel = () => {
    form.setFieldsValue(chatConf);
  };

  const onReset = async () => {
    const chatData = await invoke('reset_app_conf');
    setChatConf(chatData);
    const isOk = await dialog.ask(`配置重置成功, 是否重启?`, {
      title: 'ChatGPT Preferences',
    });
    if (isOk) {
      process.relaunch();
      return;
    }
    message.success('配置重置成功');
  };

  const onFinish = async (values: any) => {
    if (!isEqual(omit(chatConf, ['default_origin']), values)) {
      await invoke('form_confirm', { data: values, label: 'main' });
      const isOk = await dialog.ask(`配置保存成功, 是否重启?`, {
        title: 'ChatGPT 首选项',
      });
      if (isOk) {
        process.relaunch();
        return;
      }
      message.success('配置保存成功');
    }
  };

  const handleTab = (v: string) => {
    setActiveKey(v);
  };

  return (
    <div>
      <FilePath paths={APP_CONF_JSON} />
      <Form
        form={form}
        style={{ maxWidth: 500 }}
        onFinish={onFinish}
        labelCol={{ span: 10 }}
        wrapperCol={{ span: 13, offset: 1 }}
      >
        <Tabs
          activeKey={activeKey}
          onChange={handleTab}
          items={[
            { label: '常规', key: 'general', children: <General /> },
            { label: '主界面', key: 'main_window', children: <MainWindow /> },
            { label: '系统托盘', key: 'tray_window', children: <TrayWindow /> },
          ]}
        />

        <Form.Item>
          <Space size={20}>
            <Button onClick={onCancel}>取消</Button>
            <Button type="primary" htmlType="submit">
              确定
            </Button>
            <Popconfirm
              title={
                <div style={{ width: 360 }}>
                  你确定将配置文件
                  <a onClick={() => shell.open(filePath)} style={{ margin: '0 5px' }}>
                    {filePath}
                  </a>
                  恢复到默认吗?
                </div>
              }
              onConfirm={onReset}
              okText="是"
              cancelText="否"
            >
              <Button type="dashed">恢复默认</Button>
            </Popconfirm>
          </Space>
        </Form.Item>
      </Form>
    </div>
  );
}
