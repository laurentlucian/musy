import { cn } from '../cn';

const Waver = ({ className, dark }: { className?: string; dark?: boolean }) => {
  return (
    <div className={cn('la-line-scale-pulse-out', { 'la-dark': dark }, className)}>
      <div />
      <div />
      <div />
      <div />
      <div />
    </div>
  );
};

export default Waver;
