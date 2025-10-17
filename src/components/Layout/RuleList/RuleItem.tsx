import clsx from "clsx";
import type { AlarmRule } from "../../../types/alarm";
import { ActivationStatus } from "../../UI";


type RuleItemProps = {
  rule: AlarmRule;
  selectedRuleId?: string;
  onRuleSelect: (ruleId: string) => void;
  onToggleEnabled: (ruleId: string) => void;
}
export function RuleItem({ rule, selectedRuleId, onRuleSelect, onToggleEnabled }: RuleItemProps) {
  return (
    <div
      key={rule.id}
      className={clsx("p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-150", selectedRuleId === rule.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent')}
      role="button"
      onClick={() => onRuleSelect(rule.id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-medium text-gray-800 flex items-center">
            <span className="mr-2">{rule.enabled ? '🔔' : '🔕'}</span>
            {rule.name}
          </h3>
          <ActivationStatus enabled={rule.enabled} className='text-sm mt-1' />
        </div>
        {/* TODO: ToggleButton 컴포넌트로 추상화하기 */}
        <button
          className={`ml-2 relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${rule.enabled ? 'bg-green-500' : 'bg-gray-300'
            }`}
          onClick={(e) => {
            e.stopPropagation()
            onToggleEnabled(rule.id)
          }}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 shadow-sm ${rule.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
          />
        </button>
      </div>

    </div>
  );
}