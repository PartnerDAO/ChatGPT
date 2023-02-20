import { Table, Switch, Tag } from 'antd';

import { genCmd } from '@/utils';

export const syncColumns = () => [
  {
    title: '/{cmd}',
    dataIndex: 'cmd',
    fixed: 'left',
    // width: 120,
    key: 'cmd',
    render: (_: string, row: Record<string, string>) => (
      <Tag color="#2a2a2a">/{genCmd(row.act)}</Tag>
    ),
  },
  {
    title: '行为',
    dataIndex: 'act',
    key: 'act',
    // width: 200,
  },
  {
    title: '标签',
    dataIndex: 'tags',
    key: 'tags',
    // width: 150,
    render: () => <Tag>chatgpt-prompts</Tag>,
  },
  {
    title: '开关',
    dataIndex: 'enable',
    key: 'enable',
    // width: 80,
    render: (v: boolean = false, row: Record<string, any>, action: Record<string, any>) => (
      <Switch checked={v} onChange={(v) => action.setRecord({ ...row, enable: v }, 'enable')} />
    ),
  },
  Table.EXPAND_COLUMN,
  {
    title: 'Prompt',
    dataIndex: 'prompt',
    key: 'prompt',
    // width: 300,
    render: (v: string) => <span className="chat-prompts-val">{v}</span>,
  },
];
