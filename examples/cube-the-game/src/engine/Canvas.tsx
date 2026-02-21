import { useEffect, useRef } from "react";

interface Properties {
  render: (
    context: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) => void;
}

const Canvas = ({ render }: Properties) => {
  const reference = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = reference.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return undefined;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener("resize", resize);

    return () => window.removeEventListener("resize", resize);
  }, []);

  useEffect(() => {
    const canvas = reference.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return undefined;

    let frame: number;

    const loop = () => {
      render(context, canvas.width, canvas.height);
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(frame);
  }, [render]);

  return <canvas ref={reference} style={{ display: "block" }} />;
};

export default Canvas;
