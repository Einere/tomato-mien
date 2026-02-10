import { ClockIcon } from '@/components/UI';

export function EmptyRuleList() {
  return (
    <li className='p-6 text-secondary text-center'>
      <div className='flex justify-center mb-3'>
        <ClockIcon size={32} className='text-gray-300' />
      </div>
      <p className='font-medium mb-2'>알람 규칙이 없습니다</p>
      <p className='text-sm'>새 규칙을 추가해보세요.</p>
    </li>
  );
}
