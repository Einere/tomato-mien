import type { PropsWithChildren } from 'react';
import clsx from 'clsx';

type CalloutProps = {
  Icon: React.ReactNode;
  className?: string;
};
export function Callout(props: PropsWithChildren<CalloutProps>) {
  const { Icon, children, className } = props;

  return (
    <div className={clsx('p-4 rounded-lg', className)}>
      <div className='flex items-start gap-3 mt-0.5'>
        {Icon}
        <div>{children}</div>
      </div>
    </div>
  );
}
