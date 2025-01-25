import React from 'react';
import { Button, Tag } from 'antd';
import { LineChartOutlined } from '@ant-design/icons';

export const columns = [
    {
      title: 'Symbol',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: 'Strategy',
      dataIndex: 'strategy',
      key: 'strategy',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'BUY' ? 'green' : 'red'}>{type}</Tag>
      ),
    },
    {
      title: 'Entry Time',
      dataIndex: 'entryTime',
      key: 'entryTime',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'open' ? 'blue' : 'gray'}>{status}</Tag>
      ),
    },
    {
      title: 'Profit',
      dataIndex: 'profit',
      key: 'profit',
      render: (profit) => (
        <span style={{ color: profit >= 0 ? '#3f8600' : '#cf1322' }}>
          ${profit.toFixed(2)}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<LineChartOutlined />}
          onClick={() => showPositionDetails(record)}
        >
          Details
        </Button>
      ),
    },
  ];