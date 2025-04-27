import { useMotionValue, useSpring } from "motion/react";
import { useLayoutEffect, useRef } from "react";

export function NumberAnimated({
  className,
  value,
}: {
  className?: string;
  value: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 50,
  });

  useLayoutEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  useLayoutEffect(
    () =>
      springValue.on("change", (latest) => {
        if (ref.current) {
          ref.current.textContent = latest.toLocaleString(undefined, {
            maximumFractionDigits: 0,
          });
        }
      }),
    [springValue],
  );

  return (
    <span className={className} ref={ref}>
      0
    </span>
  );
}
