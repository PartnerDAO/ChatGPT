import { Form, Switch, Input, InputNumber, Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import { DISABLE_AUTO_COMPLETE } from '@/utils';
import SwitchOrigin from '@/components/SwitchOrigin';

const UALabel = () => {
  return (
    <span>
      User Agent (SystemTray){' '}
      <Tooltip title={<div>为了获得更好的体验，我们建议使用移动端UA。</div>}>
        <QuestionCircleOutlined style={{ color: '#1677ff' }} />
      </Tooltip>
    </span>
  );
};

export default function TrayWindow() {
  return (
    <>
      <Form.Item label="开启系统托盘" name="tray" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item label="默认宽度" name="tray_width">
        <InputNumber />
      </Form.Item>
      <Form.Item label="默认高度" name="tray_height">
        <InputNumber />
      </Form.Item>
      <SwitchOrigin name="tray" />
      <Form.Item label={<UALabel />} name="ua_tray">
        <Input.TextArea
          autoSize={{ minRows: 4, maxRows: 4 }}
          {...DISABLE_AUTO_COMPLETE}
          placeholder="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
        />
      </Form.Item>
    </>
  );
}
