import { Tag, Switch, Space, Popconfirm, Table } from 'antd';

export const modelColumns = () => [
  {
    title: '/{cmd}',
    dataIndex: 'cmd',
    fixed: 'left',
    width: 120,
    key: 'cmd',
    render: (v: string) => <Tag color="#2a2a2a">/{v}</Tag>,
  },
  {
    title: '行为',
    dataIndex: 'act',
    key: 'act',
    width: 200,
  },
  {
    title: '标签',
    dataIndex: 'tags',
    key: 'tags',
    width: 150,
    render: (v: string[]) => (
      <span className="chat-prompts-tags">
        {v?.map((i) => (
          <Tag key={i}>{i}</Tag>
        ))}
      </span>
    ),
  },
  {
    title: '开关',
    dataIndex: 'enable',
    key: 'enable',
    width: 80,
    render: (v: boolean = false, row: Record<string, any>, action: Record<string, any>) => (
      <Switch checked={v} onChange={(v) => action.setRecord({ ...row, enable: v }, 'enable')} />
    ),
  },
  Table.EXPAND_COLUMN,
  {
    title: 'Prompt',
    dataIndex: 'prompt',
    key: 'prompt',
    width: 300,
    render: (v: string) => <span className="chat-prompts-val">{v}</span>,
  },
  {
    title: '操作',
    key: 'action',
    fixed: 'right',
    width: 120,
    render: (_: any, row: any, actions: any) => (
      <Space size="middle">
        <a onClick={() => actions.setRecord(row, 'edit')}>Edit</a>
        <Popconfirm
          title="Are you sure to delete this model?"
          onConfirm={() => actions.setRecord(row, 'delete')}
          okText="Yes"
          cancelText="No"
        >
          <a>Delete</a>
        </Popconfirm>
      </Space>
    ),
  },
];
