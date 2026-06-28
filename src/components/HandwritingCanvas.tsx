"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";

export type HandwritingCanvasHandle = {
  getDataUrl: () => string | null;
  clear: () => void;
  isEmpty: () => boolean;
};

const HandwritingCanvas = forwardRef<HandwritingCanvasHandle, object>(
  function HandwritingCanvas(_props, ref) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const drawingRef = useRef(false);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);
    const emptyRef = useRef(true);
    const [, setHasDrawn] = useState(false);

    useImperativeHandle(ref, () => ({
      getDataUrl: () => {
        if (emptyRef.current) return null;
        return canvasRef.current?.toDataURL("image/png") ?? null;
      },
      clear,
      isEmpty: () => emptyRef.current,
    }));

    function getContext() {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      return canvas.getContext("2d");
    }

    function getPoint(e: React.PointerEvent<HTMLCanvasElement>) {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((e.clientX - rect.left) / rect.width) * canvas.width,
        y: ((e.clientY - rect.top) / rect.height) * canvas.height,
      };
    }

    function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
      e.preventDefault();
      drawingRef.current = true;
      lastPointRef.current = getPoint(e);
      emptyRef.current = false;
      setHasDrawn(true);
    }

    function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
      if (!drawingRef.current) return;
      e.preventDefault();
      const ctx = getContext();
      const point = getPoint(e);
      if (!ctx || !lastPointRef.current) return;

      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#1f2937";
      ctx.beginPath();
      ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();

      lastPointRef.current = point;
    }

    function handlePointerUp() {
      drawingRef.current = false;
      lastPointRef.current = null;
    }

    function clear() {
      const ctx = getContext();
      const canvas = canvasRef.current;
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      emptyRef.current = true;
      setHasDrawn(false);
    }

    return (
      <div className="flex flex-col items-center gap-2">
        <canvas
          ref={canvasRef}
          width={300}
          height={300}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="touch-none rounded border-2 border-gray-300 bg-white"
          style={{ width: 240, height: 240 }}
        />
        <button
          type="button"
          onClick={clear}
          className="text-xs font-semibold text-gray-500 underline"
        >
          消してやり直す
        </button>
      </div>
    );
  }
);

export default HandwritingCanvas;
