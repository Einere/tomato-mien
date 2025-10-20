import React from 'react';
import { Button } from '../UI';
import { useAlarmActions } from '../../hooks';

interface ToolbarProps {
  title: string;
}

export const Toolbar: React.FC<ToolbarProps> = ({ title }) => {
  const { addRule } = useAlarmActions();

  const handleAddRule = () => {
    const newRule = {
      id: Date.now().toString(),
      name: '새 알람 규칙',
      enabled: true,
      condition: {
        type: 'range' as const,
        startHour: 9,
        startMinute: 0,
        endHour: 17,
        endMinute: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addRule(newRule);
  };

  return (
    <div className='bg-gradient-to-r from-blue-800 to-purple-800 text-white px-4 py-3 border-b border-blue-700 shadow-lg'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <div className='text-2xl'>🍅🍜</div>
          <h1 className='text-xl font-semibold'>{title}</h1>
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            onClick={handleAddRule}
            variant='success'
            size='md'
            className='flex items-center space-x-2'
          >
            새 규칙 추가
          </Button>
          <Button variant='secondary' size='md'>
            설정
          </Button>
        </div>
      </div>
    </div>
  );
};
