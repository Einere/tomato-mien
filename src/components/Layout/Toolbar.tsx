import React from 'react'

interface ToolbarProps {
  title: string
  onAddRule: () => void
}

export const Toolbar: React.FC<ToolbarProps> = ({ title, onAddRule }) => {
  return (
    <div className="bg-gradient-to-r from-blue-800 to-purple-800 text-white px-4 py-3 border-b border-blue-700 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🍅</div>
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={onAddRule}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-sm font-medium transition-colors duration-200 flex items-center space-x-2"
          >
            <span>+</span>
            <span>새 규칙 추가</span>
          </button>
          <button className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-sm font-medium transition-colors duration-200">
            ⚙️ 설정
          </button>
        </div>
      </div>
    </div>
  )
}
