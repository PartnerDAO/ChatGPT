import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Form, Select, Tag, Tooltip, Switch } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

import useJson from '@/hooks/useJson';
import { DISABLE_AUTO_COMPLETE, CHAT_AWESOME_JSON } from '@/utils';
interface SwitchOriginProps {
  name: string;
}

const SwitchOrigin: FC<SwitchOriginProps> = ({ name }) => {
  const { json: list = [] } = useJson<any[]>(CHAT_AWESOME_JSON);
  const form = Form.useFormInstance();

  const labelName = `(${name === 'main' ? 'Main' : 'SystemTray'})`;
  const dashboardName = `${name}_dashboard`;
  const originName = `${name}_origin`;
  const isEnable = Form.useWatch(dashboardName, form);

  let urlList = [{ title: 'ChatGPT', url: 'https://chat.openai.com', init: true }];
  if (Array.isArray(list)) {
    urlList = urlList.concat(list);
  }

  return (
    <>
      <Form.Item
        label={
          <span>
            仪表盘 {labelName}{' '}
            <Tooltip
              title={
                <div>
                  <p>
                    <b>仪表板设置为应用程序默认的窗口。</b>
                  </p>
                  <p>
                    If this is enabled, the <Tag color="blue">Switch Origin {labelName}</Tag>{' '}
                    setting will be invalid.
                  </p>
                  <p>
                    If you want to add a new URL to the dashboard, add it in the{' '}
                    <Link to="/awesome">Awesome</Link> menu and make sure it is enabled.
                  </p>
                </div>
              }
            >
              <QuestionCircleOutlined style={{ color: '#1677ff' }} />
            </Tooltip>
          </span>
        }
        name={dashboardName}
        valuePropName="checked"
      >
        <Switch />
      </Form.Item>
      <Form.Item
        label={
          <span>
            切换首页 {labelName}{' '}
            <Tooltip
              title={
                <div>
                  <p>
                    <b>将单个 URL 设置为应用程序默认窗口。</b>
                  </p>
                  <p>
                    如果您需要设置一个新的网址作为应用程序加载窗口，请在 <Link to="/awesome">Awesome</Link> 菜单的页面添加，然后选择它。
                  </p>
                </div>
              }
            >
              <QuestionCircleOutlined style={{ color: '#1677ff' }} />
            </Tooltip>
          </span>
        }
        name={originName}
      >
        <Select disabled={isEnable} showSearch {...DISABLE_AUTO_COMPLETE} optionLabelProp="url">
          {urlList.map((i, idx) => (
            <Select.Option
              key={`${idx}_${i.url}`}
              label={i.title}
              value={i.url}
              title={`${i.title}${i.init ? '(Built-in)' : ''}: ${i.url}`}
            >
              <Tag color={i.init ? 'orange' : 'geekblue'}>{i.title}</Tag> {i.url}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
    </>
  );
};

export default SwitchOrigin;
