import { useSetAtom } from 'jotai';
import { addRuleAtom } from '@/store';
import { Button } from '@/components/UI/Button';
import { Icon } from '@/components/UI/Icon';

export function DashboardHeader() {
  const addRule = useSetAtom(addRuleAtom);

  return (
    <div className="flex items-center justify-between px-5 pt-6 pb-2">
      <h1 className="text-2xl font-bold text-slate-900">Rules</h1>
      <Button onClick={() => addRule()} className="gap-1">
        <Icon name="add" size="sm" className="text-white" />
        Create
      </Button>
    </div>
  );
}
