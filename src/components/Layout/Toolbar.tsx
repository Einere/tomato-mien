import React from 'react'
import { Button } from '../UI'

interface ToolbarProps {
  title: string
  onAddRule: () => void
}

export const Toolbar: React.FC<ToolbarProps> = ({ title, onAddRule }) => {
  return (
    <div className="bg-gradient-to-r from-blue-800 to-purple-800 text-white px-4 py-3 border-b border-blue-700 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🍅🍜</div>
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            onClick={onAddRule}
            variant="success"
            size="md"
            className="flex items-center space-x-2"
          >
            새 규칙 추가
          </Button>
          <Button 
            variant="secondary"
            size="md"
          >
            설정
          </Button>
        </div>
      </div>
    </div>
  )
}
