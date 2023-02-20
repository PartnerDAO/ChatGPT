import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Space, Popconfirm } from 'antd';
import { path, shell } from '@tauri-apps/api';

import { EditRow } from '@/hooks/useColumns';

import useInit from '@/hooks/useInit';
import { fmtDate, chatRoot } from '@/utils';

export const notesColumns = () => [
  {
    title: '名字',
    dataIndex: 'name',
    fixed: 'left',
    key: 'name',
    width: 240,
    render: (_: string, row: any, actions: any) => (
      <EditRow rowKey="name" row={row} actions={actions} />
    ),
  },
  {
    title: '路径',
    dataIndex: 'path',
    key: 'path',
    width: 200,
    render: (_: string, row: any) => <RenderPath row={row} />,
  },
  {
    title: '创建时间',
    dataIndex: 'created',
    key: 'created',
    width: 150,
    render: fmtDate,
  },
  {
    title: '操作',
    fixed: 'right',
    width: 160,
    render: (_: any, row: any, actions: any) => {
      return (
        <Space>
          <a onClick={() => actions.setRecord(row, 'preview')}>Preview</a>
          <Link to={`/md/${row.id}`} state={row}>
            Edit
          </Link>
          <Popconfirm
            title="Are you sure to delete this file?"
            onConfirm={() => actions.setRecord(row, 'delete')}
            okText="Yes"
            cancelText="No"
          >
            <a>Delete</a>
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
  return (await path.join(await chatRoot(), 'notes', row.id)) + `.${row.ext}`;
};
