import { useState } from 'react';
import { Form, Radio, Switch, Input, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { platform } from '@tauri-apps/api/os';

import useInit from '@/hooks/useInit';
import { DISABLE_AUTO_COMPLETE } from '@/utils';

export default function General() {
  const [platformInfo, setPlatform] = useState('');

  useInit(async () => {
    setPlatform(await platform());
  });

  return (
    <>
      <Form.Item label="置顶" name="stay_on_top" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item label="保存系统状态" name="save_window_state" valuePropName="checked">
        <Switch />
      </Form.Item>
      {platformInfo === 'darwin' && (
        <Form.Item label="Titlebar" name="titlebar" valuePropName="checked">
          <Switch />
        </Form.Item>
      )}
      {platformInfo === 'darwin' && (
        <Form.Item label="Hide Dock Icon" name="hide_dock_icon" valuePropName="checked">
          <Switch />
        </Form.Item>
      )}
      <Form.Item label="主题" name="theme">
        <Radio.Group>
          <Radio value="light">亮色</Radio>
          <Radio value="dark">暗色</Radio>
          {['darwin', 'windows'].includes(platformInfo) && <Radio value="System">System</Radio>}
        </Radio.Group>
      </Form.Item>
      <Form.Item label={<AutoUpdateLabel />} name="auto_update">
        <Radio.Group>
          <Radio value="prompt">提醒</Radio>
          <Radio value="silent">静默</Radio>
          {/*<Radio value="disable">Disable</Radio>*/}
        </Radio.Group>
      </Form.Item>
      <Form.Item label={<GlobalShortcutLabel />} name="global_shortcut">
        <Input placeholder="CmdOrCtrl+Shift+O" {...DISABLE_AUTO_COMPLETE} />
      </Form.Item>
    </>
  );
}

const AutoUpdateLabel = () => {
  return (
    <span>
      自动更新{' '}
      <Tooltip
        title={
          <div>
            <div>自动更新策略</div>
            <div>
              <strong>提醒</strong>: 提醒安装
            </div>
            <div>
              <strong>静默</strong>: 静默安装
            </div>
            {/* <div><strong>Disable</strong>: disable auto update</div> */}
          </div>
        }
      >
        <QuestionCircleOutlined style={{ color: '#1677ff' }} />
      </Tooltip>
    </span>
  );
};

const GlobalShortcutLabel = () => {
  return (
    <div>
      全局快捷键{' '}
      <Tooltip
        title={
          <div>
            <div>快捷键定义, 用“+”分隔的修饰符和按键，例如 CmdOrControl + Q</div>
            <div style={{ margin: '10px 0' }}>如果留空，则关闭快捷键功能</div>
            <a href="https://tauri.app/v1/api/js/globalshortcut" target="_blank">
              https://tauri.app/v1/api/js/globalshortcut
            </a>
          </div>
        }
      >
        <QuestionCircleOutlined style={{ color: '#1677ff' }} />
      </Tooltip>
    </div>
  );
};
