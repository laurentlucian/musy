import { useAnimationFrame, useMotionValue, useTransform } from "motion/react";
import { useRef, type PointerEvent } from "react";

const idleSpeed = 12;
const friction = 1.4;

export function useRecordSpin(reducedMotion: boolean) {
  const angle = useMotionValue(0);
  const transform = useTransform(angle, (value) => `rotate(${value}deg)`);
  const velocity = useRef(idleSpeed);
  const drag = useRef<{
    pointerId: number;
    centerX: number;
    centerY: number;
    angle: number;
    time: number;
  } | null>(null);

  useAnimationFrame((_, delta) => {
    if (drag.current || reducedMotion) return;
    const seconds = Math.min(delta, 64) / 1000;
    const decay = Math.exp(-friction * seconds);
    const excess = velocity.current - idleSpeed;
    angle.set(
      (angle.get() + idleSpeed * seconds + (excess * (1 - decay)) / friction) %
        360,
    );
    velocity.current = idleSpeed + excess * decay;
  });

  function release(event: PointerEvent<HTMLDivElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    if (
      event.type !== "pointerup" ||
      event.timeStamp - drag.current.time > 100
    ) {
      velocity.current = 0;
    }
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return {
    transform,
    onPointerDown(event: PointerEvent<HTMLDivElement>) {
      if (!event.isPrimary || event.button !== 0 || drag.current) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;
      event.currentTarget.setPointerCapture(event.pointerId);
      velocity.current = 0;
      drag.current = {
        pointerId: event.pointerId,
        centerX,
        centerY,
        angle: Math.atan2(event.clientY - centerY, event.clientX - centerX),
        time: event.timeStamp,
      };
    },
    onPointerMove(event: PointerEvent<HTMLDivElement>) {
      const previous = drag.current;
      if (!previous || previous.pointerId !== event.pointerId) return;
      const x = event.clientX - previous.centerX;
      const y = event.clientY - previous.centerY;
      const nextAngle = Math.atan2(y, x);
      const elapsed = event.timeStamp - previous.time;
      // Ignore the spindle, where tiny movements produce large angle changes.
      if (Math.hypot(x, y) >= 16 && elapsed > 0) {
        const difference = nextAngle - previous.angle;
        const degrees =
          (Math.atan2(Math.sin(difference), Math.cos(difference)) * 180) / Math.PI;
        angle.set(angle.get() + degrees);
        const speed = Math.max(-1080, Math.min(1080, (degrees * 1000) / elapsed));
        velocity.current += (speed - velocity.current) * (1 - Math.exp(-elapsed / 30));
      } else {
        velocity.current = 0;
      }
      previous.angle = nextAngle;
      previous.time = event.timeStamp;
    },
    onPointerUp: release,
    onPointerCancel: release,
    onLostPointerCapture: release,
  };
}
