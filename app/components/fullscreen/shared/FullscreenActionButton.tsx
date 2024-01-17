type Props = {
  children: React.ReactNode;
  leftIcon?: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

const FullscreenActionButton = (props: Props) => {
  return (
    <button
      className='flex w-[100vw] items-center justify-start rounded px-4 py-8 text-musy-200 hover:text-white hover:backdrop-blur-sm md:w-full'
      {...props}
    >
      {props.leftIcon && <div className='mr-3'>{props.leftIcon}</div>}
      {props.children}
    </button>
  );
};

export default FullscreenActionButton;
