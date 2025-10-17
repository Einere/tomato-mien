import clsx from 'clsx'
import React from 'react'
import type { IconProps } from '../../../types'

interface IconWrapperProps {
  className?: string
  size?: number
  outerSize?: number
  iconClassName?: string
  backgroundColor?: string
  Icon: React.FC<IconProps>
}

export const IconWrapper: React.FC<IconWrapperProps> = ({ className = '', size = 16, iconClassName = '', backgroundColor = "bg-gray-200", Icon }) => (
  <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center", className, backgroundColor)}>
    <Icon
      size={size}
      className={iconClassName} />
  </div>
)
