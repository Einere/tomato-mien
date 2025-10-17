import clsx from "clsx";

export function ActivationStatus(props: { enabled: boolean; light?: boolean; className?: string }) {
  const { enabled, light = false, className = '' } = props;

  return (
    <div className={clsx("flex items-center space-x-2", className)}>
      {light && <div className={clsx("w-2 h-2 rounded-full", enabled ? 'bg-green-500' : 'bg-gray-300')} />}
      <span className="text-secondary">{enabled ? '활성화' : '비활성화'}</span>
    </div>
  )
}