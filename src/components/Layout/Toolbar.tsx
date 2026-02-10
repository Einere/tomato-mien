import React from 'react';
import { Button } from '@/components/UI';
import { useAlarmActions } from '@/hooks';

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
    <div className='bg-white px-4 py-3 border-b border-gray-200 shadow-sm'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <div className='w-3 h-3 rounded-full bg-tomato-500'></div>
          <h1 className='text-xl font-semibold text-gray-900'>{title}</h1>
        </div>
        <div className='flex items-center space-x-2'>
          <Button
            onClick={handleAddRule}
            variant='primary'
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
