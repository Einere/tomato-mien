import clsx from 'clsx';
import React, { type JSX } from 'react';

interface IconWrapperProps {
  className?: string;
  outerSize?: number;
  backgroundColor?: string;
  Icon: JSX.Element;
  shape?: 'circle' | 'square';
}

export const IconWrapper: React.FC<IconWrapperProps> = ({
  className = '',
  backgroundColor = 'bg-gray-200',
  Icon,
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
      {Icon}
    </div>
  );
};
