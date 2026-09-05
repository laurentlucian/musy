export function NumberAnimated({
  className,
  value,
}: {
  className?: string;
  value: number;
}) {
  return (
    <span className={className}>
      {value.toLocaleString(undefined, { maximumFractionDigits: 0 })}
    </span>
  );
}
