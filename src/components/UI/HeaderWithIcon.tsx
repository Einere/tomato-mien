type HeaderwithIconProps = {
  Icon: React.ReactNode;
  title: string;
};
export function HeaderWithIcon({ Icon, title }: HeaderwithIconProps) {
  return (
    <div className='flex items-center mb-4'>
      {Icon}
      <h3 className='text-lg font-semibold text-primary'>{title}</h3>
    </div>
  );
}
