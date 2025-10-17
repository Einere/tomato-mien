import React, { useState } from 'react'
import { Toolbar } from './Toolbar'
import { RuleList } from './RuleList'
import { RuleEditor } from './RuleEditor'
import { StatusBar } from './StatusBar'
import type { AlarmRule } from '../../types/alarm'
import type { WebWorkerAlarmService } from '../../services/WebWorkerAlarmService'

interface MainLayoutProps {
  rules: AlarmRule[]
  onRuleUpdate: (rule: AlarmRule) => void
  onRuleDelete: (ruleId: string) => void
  onRuleToggle: (ruleId: string) => void
  onAddRule: () => void
  alarmService: WebWorkerAlarmService
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  rules,
  onRuleUpdate,
  onRuleDelete,
  onRuleToggle,
  onAddRule,
  alarmService,
}) => {
  // TODO: 규칙 관련 로직들을 Context API를 이용하도록 수정하기. 
  const [selectedRuleId, setSelectedRuleId] = useState<string | undefined>()

  const selectedRule = rules.find((rule) => rule.id === selectedRuleId)
  const activeRuleCount = alarmService.getActiveRuleCount()
  const lastCheckTime = alarmService.getLastCheckTime()

  return (
    <div className="h-screen flex flex-col bg-gray-200">
      {/* 툴바 */}
      <Toolbar title="Tomato Mien" onAddRule={onAddRule} />

      {/* 메인 컨텐츠 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 좌측 패널 - 규칙 리스트 */}
        <div className="w-1/4 min-w-64">
          <RuleList
            rules={rules}
            selectedRuleId={selectedRuleId}
            onRuleSelect={setSelectedRuleId}
            onToggleEnabled={onRuleToggle}
          />
        </div>

        {/* 우측 패널 - 규칙 편집기 */}
        <div className="flex-1">
          <RuleEditor
            rule={selectedRule}
            onSave={onRuleUpdate}
            onDelete={onRuleDelete}
          />
        </div>
      </div>

      {/* 상태바 */}
      <StatusBar
        activeRuleCount={activeRuleCount}
        lastCheckTime={lastCheckTime}
      />
    </div>
  )
}
