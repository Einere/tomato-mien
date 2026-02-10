import { useSetAtom } from 'jotai';
import { viewAtom } from '@/store';
import { Icon } from '@/components/UI/Icon';

interface EditorHeaderProps {
  isNew: boolean;
}

export function EditorHeader({ isNew }: EditorHeaderProps) {
  const setView = useSetAtom(viewAtom);

  return (
    <div className="flex items-center gap-3 px-5 pt-6 pb-4">
      <button
        onClick={() => setView('dashboard')}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100"
      >
        <Icon name="arrow_back" size="sm" />
      </button>
      <h1 className="text-xl font-bold text-slate-900">
        {isNew ? 'New Rule' : 'Edit Rule'}
      </h1>
    </div>
  );
}
