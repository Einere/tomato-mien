import React, {
  createContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import type { AlarmRule, AlarmStorage, AlarmEvent } from '../types/alarm';
import { WebWorkerAlarmService } from '../services/WebWorkerAlarmService';

// Context 타입 정의
interface AlarmState {
  rules: AlarmRule[];
  selectedRuleId: string | undefined;
  alarmService: WebWorkerAlarmService;
}

interface AlarmDispatchContextType {
  dispatch: React.Dispatch<AlarmAction>;
}

// Action 타입 정의
type AlarmAction =
  | { type: 'SET_RULES'; payload: AlarmRule[] }
  | { type: 'ADD_RULE'; payload: AlarmRule }
  | { type: 'UPDATE_RULE'; payload: AlarmRule }
  | { type: 'DELETE_RULE'; payload: string }
  | { type: 'TOGGLE_RULE'; payload: string }
  | { type: 'SELECT_RULE'; payload: string | undefined }
  | { type: 'SET_ALARM_SERVICE'; payload: WebWorkerAlarmService };

// Context 생성
const AlarmContext = createContext<AlarmState | null>(null);
const AlarmDispatchContext = createContext<AlarmDispatchContextType | null>(
  null,
);

// 초기 상태
const initialState: AlarmState = {
  rules: [],
  selectedRuleId: undefined,
  alarmService: WebWorkerAlarmService.getInstance(),
};

// Reducer 함수
function alarmReducer(state: AlarmState, action: AlarmAction): AlarmState {
  switch (action.type) {
    case 'SET_RULES': {
      return {
        ...state,
        rules: action.payload,
      };
    }
    case 'ADD_RULE': {
      const newRules = [...state.rules, action.payload];
      // 로컬 스토리지에 저장
      saveRulesToStorage(newRules);
      return {
        ...state,
        rules: newRules,
      };
    }
    case 'UPDATE_RULE': {
      const newRules = state.rules.map(rule =>
        rule.id === action.payload.id ? action.payload : rule,
      );
      // 로컬 스토리지에 저장
      saveRulesToStorage(newRules);
      return {
        ...state,
        rules: newRules,
      };
    }
    case 'DELETE_RULE': {
      const newRules = state.rules.filter(rule => rule.id !== action.payload);
      // 로컬 스토리지에 저장
      saveRulesToStorage(newRules);
      return {
        ...state,
        rules: newRules,
        selectedRuleId:
          state.selectedRuleId === action.payload
            ? undefined
            : state.selectedRuleId,
      };
    }
    case 'TOGGLE_RULE': {
      const newRules = state.rules.map(rule =>
        rule.id === action.payload
          ? { ...rule, enabled: !rule.enabled, updatedAt: new Date() }
          : rule,
      );
      // 로컬 스토리지에 저장
      saveRulesToStorage(newRules);

      // 개별 규칙만 워커에 업데이트
      const toggledRule = newRules.find(rule => rule.id === action.payload);
      if (toggledRule) {
        state.alarmService.updateRule(toggledRule);
      }

      return {
        ...state,
        rules: newRules,
      };
    }
    case 'SELECT_RULE': {
      return {
        ...state,
        selectedRuleId: action.payload,
      };
    }
    case 'SET_ALARM_SERVICE': {
      return {
        ...state,
        alarmService: action.payload,
      };
    }
    default: {
      throw new Error(`Unknown action type: ${(action as any).type}`);
    }
  }
}

// 로컬 스토리지 저장 함수
function saveRulesToStorage(rules: AlarmRule[]): void {
  const storage: AlarmStorage = {
    rules,
    lastCheck: new Date(),
  };
  localStorage.setItem('tomato-mien-rules', JSON.stringify(storage));
}

// Provider 컴포넌트
export function AlarmProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(alarmReducer, initialState);

  // 알람 서비스 초기화
  useEffect(() => {
    const alarmService = WebWorkerAlarmService.getInstance();
    dispatch({ type: 'SET_ALARM_SERVICE', payload: alarmService });
  }, []);

  // 샘플 데이터 로드 함수
  const loadSampleData = useCallback(() => {
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
    ];
    dispatch({ type: 'SET_RULES', payload: sampleRules });
  }, [dispatch]);

  // 초기 데이터 로드
  useEffect(() => {
    const saved = localStorage.getItem('tomato-mien-rules');
    if (saved) {
      try {
        const storage: AlarmStorage = JSON.parse(saved);
        dispatch({ type: 'SET_RULES', payload: storage.rules });
      } catch (error) {
        console.error('Failed to load rules from localStorage:', error);
        // 샘플 데이터 로드
        loadSampleData();
      }
    } else {
      loadSampleData();
    }
  }, [loadSampleData]);

  // 알람 서비스 초기화
  useEffect(() => {
    const alarmService = state.alarmService;

    // 알람 이벤트 콜백 설정
    alarmService.setAlarmCallback((event: AlarmEvent) => {
      console.log('Alarm event received:', event);
    });

    // 컴포넌트 언마운트 시 알람 서비스 중지
    return () => {
      alarmService.stop();
    };
  }, [state.alarmService]);

  // 규칙이 변경될 때마다 알람 서비스에 업데이트
  useEffect(() => {
    state.alarmService.updateRules(state.rules);
    state.alarmService.start();
  }, [state.rules, state.alarmService]);

  // Electron 메뉴 이벤트 처리
  useEffect(() => {
    if (window.electronAPI) {
      const handleMenuAction = (_event: any, action: string) => {
        switch (action) {
          case 'menu-new-rule': {
            handleAddRule();
            break;
          }
          case 'menu-enable-all-alarms': {
            const enabledRules = state.rules.map(rule => ({
              ...rule,
              enabled: true,
            }));
            dispatch({ type: 'SET_RULES', payload: enabledRules });
            break;
          }
          case 'menu-disable-all-alarms': {
            const disabledRules = state.rules.map(rule => ({
              ...rule,
              enabled: false,
            }));
            dispatch({ type: 'SET_RULES', payload: disabledRules });
            break;
          }
          case 'menu-about': {
            alert('Tomato Mien v1.0.0\nSimple rule-based alarm app');
            break;
          }
        }
      };

      window.electronAPI.onMenuAction(handleMenuAction);

      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      return () => {
        window.electronAPI?.removeMenuListeners();
      };
    }
  }, [state.rules]);

  // 액션 핸들러들
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
    };
    dispatch({ type: 'ADD_RULE', payload: newRule });
  };

  return (
    <AlarmContext.Provider value={state}>
      <AlarmDispatchContext.Provider value={{ dispatch }}>
        {children}
      </AlarmDispatchContext.Provider>
    </AlarmContext.Provider>
  );
}

// Context들을 export하여 다른 파일에서 사용할 수 있도록 함
export { AlarmContext, AlarmDispatchContext };
