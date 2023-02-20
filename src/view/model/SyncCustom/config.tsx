import { useState } from 'react';
import { Tag, Space, Popconfirm } from 'antd';
import { HistoryOutlined } from '@ant-design/icons';
import { shell, path } from '@tauri-apps/api';
import { Link } from 'react-router-dom';

import useInit from '@/hooks/useInit';
import { chatRoot, fmtDate } from '@/utils';

export const syncColumns = () => [
  {
    title: '名字',
    dataIndex: 'name',
    key: 'name',
    width: 100,
  },
  {
    title: '协议',
    dataIndex: 'protocol',
    key: 'protocol',
    width: 80,
    render: (v: string) => <Tag>{v}</Tag>,
  },
  {
    title: '路径',
    dataIndex: 'path',
    key: 'path',
    width: 180,
    render: (_: string, row: any) => <RenderPath row={row} />,
  },
  {
    title: '上次更新时间',
    dataIndex: 'last_updated',
    key: 'last_updated',
    width: 140,
    render: (v: number) => (
      <div>
        <HistoryOutlined style={{ marginRight: 5, color: v ? '#52c41a' : '#ff4d4f' }} />
        {v ? fmtDate(v) : ''}
      </div>
    ),
  },
  {
    title: '操作',
    fixed: 'right',
    width: 150,
    render: (_: any, row: any, actions: any) => {
      return (
        <Space>
          <Popconfirm
            overlayStyle={{ width: 250 }}
            title="Sync will overwrite the previous data, confirm to sync?"
            onConfirm={() => actions.setRecord(row, 'sync')}
            okText="Yes"
            cancelText="No"
          >
            <a>同步</a>
          </Popconfirm>
          {row.last_updated && (
            <Link to={`${row.id}`} state={row}>
              浏览
            </Link>
          )}
          <a onClick={() => actions.setRecord(row, 'edit')}>Edit</a>
          <Popconfirm
            title="Are you sure to delete this path?"
            onConfirm={() => actions.setRecord(row, 'delete')}
            okText="Yes"
            cancelText="No"
          >
            <a>删除</a>
          </Popconfirm>
        </Space>
      );
    },
  },
];

const RenderPath = ({ row }: any) => {
  const [filePath, setFilePath] = useState('');
  useInit(async () => {
    setFilePath(await getPath(row));
  });
  return <a onClick={() => shell.open(filePath)}>{filePath}</a>;
};

export const getPath = async (row: any) => {
  if (!/^http/.test(row.protocol)) {
    return (await path.join(await chatRoot(), row.path)) + `.${row.ext}`;
  } else {
    return `${row.protocol}://${row.path}.${row.ext}`;
  }
};
