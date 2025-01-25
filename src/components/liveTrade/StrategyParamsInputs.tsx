import React, { useState } from 'react';
import { Collapse, Input, Space, Typography, Form } from 'antd';
import { CaretRightOutlined } from '@ant-design/icons';
import StepInput from '../common/StepInput';

interface StrategyParamsInputsProps {
  params: Record<string, number> | undefined;
  onParamChange: (name: string, value: string | number) => void;
}

const StrategyParamsInputs: React.FC<StrategyParamsInputsProps> = ({
  params,
  onParamChange,
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleChange = (name: string, value: number) => {
      onParamChange(name, value);
  };

  return (
    <Collapse
      expandIcon={({ isActive }) => (
        <CaretRightOutlined rotate={isActive ? 90 : 0} />
      )}
      bordered={false}
      size="small"
      style={{ background: 'transparent' }}
      items={[
        {
          key: '1',
          label: <Typography.Text>Strategy Parameters</Typography.Text>,
          children: (
            <Space direction="horizontal" size={4} style={{ width: '100%', flexWrap: 'wrap' }}>
              {params && Object.entries(params).map(([key, value]) => (
                <Form.Item
                  key={key}
                  label={key}
                  style={{ marginBottom: 4, marginRight: 4, fontSize: 10 }}
                >
                  <StepInput
                    value={value}
                    onChange={(value: number) => handleChange(key, value)}
                    size="small"
                    style={{ width: 50 }}
                  />
                </Form.Item>
              ))}
            </Space>
          ),
        },
      ]}
    />
  );
};

export default StrategyParamsInputs;
