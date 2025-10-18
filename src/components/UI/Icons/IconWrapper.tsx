import clsx from 'clsx';
import React from 'react';

interface IconWrapperProps {
  className?: string;
  outerSize?: number;
  backgroundColor?: string;
  shape?: 'circle' | 'square';
}

export const IconWrapper: React.FC<
  React.PropsWithChildren<IconWrapperProps>
> = ({
  className = '',
  backgroundColor = 'bg-gray-200',
  children,
  shape = 'square',
}) => {
  const shapeClassName = shape === 'circle' ? 'rounded-full' : 'rounded-lg';

  return (
    <div
      className={clsx(
        'size-8 flex items-center justify-center',
        className,
        backgroundColor,
        shapeClassName,
      )}
    >
      {children}
    </div>
  );
};
