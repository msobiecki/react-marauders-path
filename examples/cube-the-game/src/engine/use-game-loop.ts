import { useEffect, useRef } from "react";

const useGameLoop = (update: (delta: number) => void) => {
  const lastTimeReference = useRef<number>(0);
  const frameReference = useRef<number>(0);

  useEffect(() => {
    const loop = (time: number) => {
      const delta = (time - lastTimeReference.current) / 1000;
      lastTimeReference.current = time;

      update(delta);
      frameReference.current = requestAnimationFrame(loop);
    };

    frameReference.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(frameReference.current);
  }, [update]);
};

export default useGameLoop;
