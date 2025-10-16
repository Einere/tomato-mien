import React from 'react'

interface StatusBarProps {
  activeRuleCount: number
  lastCheckTime: Date | null
}

export const StatusBar: React.FC<StatusBarProps> = ({
  activeRuleCount,
  lastCheckTime,
}) => {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div className="bg-gray-800 text-white px-4 py-3 text-sm border-t border-gray-600 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <span className="flex items-center">
            <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            <span className="font-medium">활성 규칙: {activeRuleCount}개</span>
          </span>
          {lastCheckTime && (
            <span className="text-gray-300 flex items-center">
              <span className="mr-1">🕐</span>
              마지막 체크: {formatTime(lastCheckTime)}
            </span>
          )}
        </div>
        <div className="text-gray-300 flex items-center">
          <span className="mr-1">⚡</span>
          알람 서비스 실행 중
        </div>
      </div>
    </div>
  )
}
