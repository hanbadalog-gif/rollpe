"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./draw-panel.module.css";
import type { CreateNoteInput } from "@/features/canvas/types";
import { showToast } from "@/components/Toast";

const COLORS = ["#2a2010", "#e6453f", "#f2c12e", "#3fae5a", "#3a7bd5", "#9b5de5"];
const SIZES = [3, 6, 11];
const CANVAS_W = 260;
const CANVAS_H = 180;

type Tool = "pen" | "highlighter" | "eraser";

/** 손그림 패널 — rolling-paper.site 벤치마킹, 필압/redo는 생략(ponytail) */
export function DrawPanel({ onSubmit, onDone }: { onSubmit: (input: CreateNoteInput) => Promise<unknown>; onDone: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const strokeBase = useRef<ImageData | null>(null);
  const strokePoints = useRef<{ x: number; y: number }[]>([]);
  const history = useRef<ImageData[]>([]);

  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(SIZES[1]);
  const [submitting, setSubmitting] = useState(false);

  function fillWhite(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }

  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) fillWhite(ctx);
  }, []);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * CANVAS_W,
      y: ((e.clientY - rect.top) / rect.height) * CANVAS_H,
    };
  }

  function snapshot() {
    const ctx = canvasRef.current?.getContext("2d");
    return ctx ? ctx.getImageData(0, 0, CANVAS_W, CANVAS_H) : null;
  }

  function pushHistory() {
    const snap = snapshot();
    if (!snap) return;
    history.current.push(snap);
    if (history.current.length > 20) history.current.shift();
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    pushHistory();
    drawing.current = true;
    strokeBase.current = history.current[history.current.length - 1] ?? snapshot();
    strokePoints.current = [pos(e)];
  }

  // 획 전체를 base 스냅샷 위에 한 번에 다시 그려서, 반투명(형광펜) 선분들이 겹칠 때
  // 블렌딩이 중복되어 점선처럼 보이는 문제를 피한다.
  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current || !strokeBase.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    strokePoints.current.push(pos(e));

    ctx.putImageData(strokeBase.current, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (tool === "eraser") {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = size * 2;
    } else if (tool === "highlighter") {
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 2.5;
    } else {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
    }
    ctx.beginPath();
    const [first, ...rest] = strokePoints.current;
    ctx.moveTo(first.x, first.y);
    for (const p of rest) ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }

  function handlePointerUp() {
    drawing.current = false;
    strokeBase.current = null;
    strokePoints.current = [];
  }

  function handleUndo() {
    const ctx = canvasRef.current?.getContext("2d");
    const snapshot = history.current.pop();
    if (ctx && snapshot) ctx.putImageData(snapshot, 0, 0);
  }

  function handleClear() {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    pushHistory();
    fillWhite(ctx);
  }

  async function handleSubmit() {
    const canvas = canvasRef.current;
    if (!canvas || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit({ type: "photo", photoUrl: canvas.toDataURL("image/png") });
      showToast("그림을 캔버스에 추가했어요");
      onDone();
    } catch {
      showToast("추가하지 못했어요");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.panel}>
      <h4 className={styles.heading}>손그림</h4>

      <div className={styles.toolRow}>
        {(["pen", "highlighter", "eraser"] as Tool[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`${styles.toolBtn} ${tool === t ? styles.toolBtnOn : ""}`}
            onClick={() => setTool(t)}
          >
            {t === "pen" ? "펜" : t === "highlighter" ? "형광펜" : "지우개"}
          </button>
        ))}
      </div>

      <div className={styles.row}>
        {SIZES.map((s) => (
          <button
            key={s}
            type="button"
            className={`${styles.sizeBtn} ${size === s ? styles.sizeBtnOn : ""}`}
            onClick={() => setSize(s)}
            aria-label={`굵기 ${s}`}
          >
            <span style={{ width: s, height: s }} />
          </button>
        ))}
      </div>

      <div className={styles.row}>
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            className={`${styles.swatch} ${tool !== "eraser" && color === c ? styles.swatchOn : ""}`}
            style={{ background: c }}
            onClick={() => setColor(c)}
            aria-label={c}
          />
        ))}
        <input
          type="color"
          className={styles.customSwatch}
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>

      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className={styles.canvas}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      />

      <div className={styles.row}>
        <button type="button" className={styles.minorBtn} onClick={handleUndo}>
          실행취소
        </button>
        <button type="button" className={styles.minorBtn} onClick={handleClear}>
          전체 지우기
        </button>
      </div>

      <button type="button" className={styles.submit} disabled={submitting} onClick={handleSubmit}>
        캔버스에 추가
      </button>
    </div>
  );
}
