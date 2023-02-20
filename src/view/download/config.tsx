import { useState } from 'react';
import { Tag, Space, Popconfirm } from 'antd';
import { path, shell } from '@tauri-apps/api';

import { EditRow } from '@/hooks/useColumns';

import useInit from '@/hooks/useInit';
import { fmtDate, chatRoot } from '@/utils';

const colorMap: any = {
  pdf: 'blue',
  png: 'orange',
};

export const downloadColumns = () => [
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
    title: '拓展',
    dataIndex: 'ext',
    key: 'ext',
    width: 120,
    render: (v: string) => <Tag color={colorMap[v]}>{v}</Tag>,
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
    width: 150,
    render: (_: any, row: any, actions: any) => {
      return (
        <Space>
          <a onClick={() => actions.setRecord(row, 'preview')}>Preview</a>
          <Popconfirm
            title="你是否要删除这个文件?"
            onConfirm={() => actions.setRecord(row, 'delete')}
            okText="是"
            cancelText="否"
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
  const isImg = ['png'].includes(row?.ext);
  return (
    (await path.join(await chatRoot(), 'download', isImg ? 'img' : row.ext, row.id)) + `.${row.ext}`
  );
};
