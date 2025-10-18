type ToggleButtonProps = {
  enabled: boolean;
  onToggle: (checked: boolean) => void;
};
export function ToggleButton({ enabled, onToggle }: ToggleButtonProps) {
  return (
    <input
      type='checkbox'
      checked={enabled}
      className={'toggle-btn bg-gray-300 checked:bg-green-500'}
      onChange={e => {
        e.stopPropagation();
        onToggle(e.target.checked);
      }}
    />
  );
}
