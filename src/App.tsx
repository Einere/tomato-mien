import { useState, useEffect } from 'react'
import { MainLayout } from './components/Layout/MainLayout'
import type { AlarmRule, AlarmStorage, AlarmEvent } from './types/alarm'
import { WebWorkerAlarmService } from './services/WebWorkerAlarmService'

function App() {
  // TODO: 규칙 관련 로직들을 Context API를 이용하도록 수정하기.
  const [rules, setRules] = useState<AlarmRule[]>([])
  const [alarmService] = useState(() => WebWorkerAlarmService.getInstance())

  // 로컬 스토리지에서 규칙 로드
  useEffect(() => {
    const saved = localStorage.getItem('tomato-mien-rules')
    if (saved) {
      try {
        const storage: AlarmStorage = JSON.parse(saved)
        setRules(storage.rules)
      } catch (error) {
        console.error('Failed to load rules from localStorage:', error)
      }
    } else {
      // 샘플 데이터
      const sampleRules: AlarmRule[] = [
        {
          id: '1',
          name: '업무 시간 알람',
          enabled: true,
          condition: {
            type: 'range',
            startHour: 9,
            startMinute: 0,
            endHour: 18,
            endMinute: 0,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          name: '15분 간격 알람',
          enabled: false,
          condition: {
            type: 'interval',
            intervalMinutes: 15,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]
      setRules(sampleRules)
    }
  }, [])

  // 알람 서비스 초기화
  useEffect(() => {
    // 알람 이벤트 콜백 설정
    alarmService.setAlarmCallback((event: AlarmEvent) => {
      console.log('Alarm event received:', event)
      // 여기에 추가적인 UI 업데이트나 로직을 추가할 수 있습니다
    })

    // 컴포넌트 언마운트 시 알람 서비스 중지
    return () => {
      alarmService.stop()
    }
  }, [alarmService])

  // Electron 메뉴 이벤트 처리
  useEffect(() => {
    if (window.electronAPI) {
      const handleMenuAction = (_event: any, action: string) => {
        console.log('Menu action received:', action)
        switch (action) {
          case 'menu-new-rule':
            handleAddRule()
            break
          case 'menu-enable-all-alarms':
            const enabledRules = rules.map((rule) => ({ ...rule, enabled: true }))
            saveRules(enabledRules)
            break
          case 'menu-disable-all-alarms':
            const disabledRules = rules.map((rule) => ({ ...rule, enabled: false }))
            saveRules(disabledRules)
            break
          case 'menu-about':
            alert('Tomato Mien v1.0.0\nSimple rule-based alarm app')
            break
        }
      }

      window.electronAPI.onMenuAction(handleMenuAction)

      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      return () => {
        window.electronAPI?.removeMenuListeners()
      }
    }
  }, [rules]) // rules 의존성 추가

  // 규칙이 변경될 때마다 알람 서비스에 업데이트
  useEffect(() => {
    alarmService.updateRules(rules)
    alarmService.start()
  }, [rules, alarmService])

  // 로컬 스토리지에 규칙 저장
  const saveRules = (newRules: AlarmRule[]) => {
    const storage: AlarmStorage = {
      rules: newRules,
      lastCheck: new Date(),
    }
    localStorage.setItem('tomato-mien-rules', JSON.stringify(storage))
    setRules(newRules)
  }

  const handleRuleUpdate = (updatedRule: AlarmRule) => {
    const newRules = rules.map((rule) =>
      rule.id === updatedRule.id ? updatedRule : rule
    )
    saveRules(newRules)
  }

  const handleRuleDelete = (ruleId: string) => {
    const newRules = rules.filter((rule) => rule.id !== ruleId)
    saveRules(newRules)
  }

  const handleRuleToggle = (ruleId: string) => {
    const updatedRule = rules.find(rule => rule.id === ruleId)
    if (updatedRule) {
      const toggledRule = { ...updatedRule, enabled: !updatedRule.enabled }
      const newRules = rules.map((rule) =>
        rule.id === ruleId ? toggledRule : rule
      )
      saveRules(newRules)

      // 개별 규칙만 워커에 업데이트
      alarmService.updateRule(toggledRule)
    }
  }

  const handleAddRule = () => {
    const newRule: AlarmRule = {
      id: Date.now().toString(),
      name: '새 알람 규칙',
      enabled: true,
      condition: {
        type: 'range',
        startHour: 9,
        startMinute: 0,
        endHour: 17,
        endMinute: 0,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    saveRules([...rules, newRule])
  }

  return <MainLayout
    rules={rules}
    onRuleUpdate={handleRuleUpdate}
    onRuleDelete={handleRuleDelete}
    onRuleToggle={handleRuleToggle}
    onAddRule={handleAddRule}
    alarmService={alarmService}
  />
}

export default App
