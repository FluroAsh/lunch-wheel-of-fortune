"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Curated palette — dark tones with strong contrast for white text,
// designed to feel premium rather than game-show bright.
const SEGMENT_COLORS = [
  "#1e3a5f", // deep navy
  "#1a4731", // forest
  "#3d1a5f", // violet
  "#5f2d1a", // copper
  "#1a4747", // teal
  "#5f1a3a", // rose
  "#2d401a", // olive
  "#1a2d5f", // royal blue
];

const MAX_SIZE_PX = 420;
const LABEL_FONT_SIZE = 12; // fixed — radial orientation gives enough room
const MIN_ROTATIONS = 5;
const SPIN_DURATION_MS = 4500;
const FONT_FAMILY = '"Geist Sans", ui-sans-serif, system-ui, sans-serif';

// Ease-out cubic — decelerates smoothly from fast to a full stop
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// Truncate a label to fit within maxPxWidth at the current ctx.font,
// appending an ellipsis if characters are removed.
function truncateTextToFit(
  ctx: CanvasRenderingContext2D,
  label: string,
  maxPxWidth: number,
): string {
  if (ctx.measureText(label).width <= maxPxWidth) return label;

  let truncated = label;
  while (
    truncated.length > 1 &&
    ctx.measureText(`${truncated}…`).width > maxPxWidth
  ) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}…`;
}

export type WheelSegment = {
  label: string;
};

type WheelCanvasProps = {
  segments: WheelSegment[];
  prizeIndex: number;
  mustSpin: boolean;
  onSpinComplete: () => void;
};

export function WheelCanvas({
  segments,
  prizeIndex,
  mustSpin,
  onSpinComplete,
}: WheelCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef<number>(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const startRotationRef = useRef<number>(0);
  const targetRotationRef = useRef<number>(0);
  const isSpinningRef = useRef<boolean>(false);

  // Initialise to 0 — ResizeObserver sets the true size after first paint.
  // Avoids the MAX_SIZE_PX > actual-width collapse that causes layout shift.
  const [canvasSize, setCanvasSize] = useState<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const width = Math.floor(entry.contentRect.width);
      setCanvasSize(Math.min(width, MAX_SIZE_PX));
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const segmentAngle = (2 * Math.PI) / Math.max(segments.length, 1);

  const drawWheel = useCallback(
    (rotation: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      if (canvasSize === 0) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const size = canvasSize;

      // Reset transform without resizing the backing buffer on every frame
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const cx = size / 2;
      const cy = size / 2;
      const radius = size / 2 - 6;

      ctx.clearRect(0, 0, size, size);

      // --- Outer ring ---
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 4, 0, 2 * Math.PI);
      ctx.fillStyle = "#0a0a0a";
      ctx.fill();
      ctx.strokeStyle = "#2a2a2a";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // --- Segments ---
      segments.forEach((segment, i) => {
        const startAngle = rotation + i * segmentAngle - Math.PI / 2;
        const endAngle = startAngle + segmentAngle;
        const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];

        // Fill
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();

        // Subtle divider line along the segment start edge
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(
          cx + radius * Math.cos(startAngle),
          cy + radius * Math.sin(startAngle),
        );
        ctx.strokeStyle = "rgba(255,255,255,0.08)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // --- Label (radial orientation) ---
        // Drawing text along the radius (centre → rim) instead of across the
        // arc gives ~65% of the radius as usable width, vs. the narrow arc
        // chord which shrinks rapidly with more segments. Font stays legible
        // at any segment count.
        ctx.save();

        const labelAngle = startAngle + segmentAngle / 2;
        // Anchor the text centre at 50% of the radius along the segment midline
        const labelRadius = radius * 0.5;
        const lx = cx + labelRadius * Math.cos(labelAngle);
        const ly = cy + labelRadius * Math.sin(labelAngle);

        ctx.translate(lx, ly);
        // Rotate parallel to the radius so text reads outward from centre
        ctx.rotate(labelAngle);

        const radialAvailable = radius * 0.62;
        ctx.font = `500 ${LABEL_FONT_SIZE}px ${FONT_FAMILY}`;
        ctx.fillStyle = "rgba(255,255,255,0.90)";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const fitted = truncateTextToFit(ctx, segment.label, radialAvailable);
        ctx.fillText(fitted, 0, 0);

        ctx.restore();
      });

      // --- Centre cap ---
      const capRadius = radius * 0.1;
      ctx.beginPath();
      ctx.arc(cx, cy, capRadius, 0, 2 * Math.PI);
      ctx.fillStyle = "#0a0a0a";
      ctx.fill();
      ctx.strokeStyle = "#2a2a2a";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    },
    [segments, segmentAngle, canvasSize],
  );

  // --- Resize the backing buffer when canvasSize changes, then redraw --- //
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || canvasSize === 0) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;
    canvas.style.width = `${canvasSize}px`;
    canvas.style.height = `${canvasSize}px`;
    drawWheel(rotationRef.current);
  }, [canvasSize, drawWheel]);

  // --- Redraw when segments change (initial load / selection changes) --- //
  useEffect(() => {
    drawWheel(rotationRef.current);
  }, [drawWheel]);

  // Stable refs so the animation callback reads the latest values without
  // being listed as a dependency (animation only starts on mustSpin toggle).
  const prizeIndexRef = useRef(prizeIndex);
  const segmentAngleRef = useRef(segmentAngle);
  const segmentsLengthRef = useRef(segments.length);
  const onSpinCompleteRef = useRef(onSpinComplete);
  const drawWheelRef = useRef(drawWheel);

  useEffect(() => {
    prizeIndexRef.current = prizeIndex;
  }, [prizeIndex]);
  useEffect(() => {
    segmentAngleRef.current = segmentAngle;
  }, [segmentAngle]);
  useEffect(() => {
    segmentsLengthRef.current = segments.length;
  }, [segments.length]);
  useEffect(() => {
    onSpinCompleteRef.current = onSpinComplete;
  }, [onSpinComplete]);
  useEffect(() => {
    drawWheelRef.current = drawWheel;
  }, [drawWheel]);

  // --- Spin animation ---
  useEffect(() => {
    if (!mustSpin || isSpinningRef.current) return;
    if (segmentsLengthRef.current === 0) return;

    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }

    isSpinningRef.current = true;
    startRotationRef.current = rotationRef.current;

    // Target rotation: spin N full rotations then stop so the prize segment
    // centre aligns with the top pointer.
    //
    // Drawing: segment i centre = rotation + i×segmentAngle − π/2 + segmentAngle/2
    // Pointer: canvas top = −π/2
    // Solving: rotation + prizeAngleCenter − π/2 = −π/2  →  rotation = −prizeAngleCenter
    // The drawing's −π/2 and the pointer's −π/2 cancel; no extra offset is needed.
    const angle = segmentAngleRef.current;
    const prizeAngleCenter = prizeIndexRef.current * angle + angle / 2;
    const offsetToTop = -prizeAngleCenter;
    const fullRotations = MIN_ROTATIONS * 2 * Math.PI;

    targetRotationRef.current =
      Math.ceil(startRotationRef.current / (2 * Math.PI)) * (2 * Math.PI) +
      fullRotations +
      (((offsetToTop % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI));

    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (startTimeRef.current === null) startTimeRef.current = timestamp;

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / SPIN_DURATION_MS, 1);

      rotationRef.current =
        startRotationRef.current +
        (targetRotationRef.current - startRotationRef.current) *
          easeOut(progress);

      drawWheelRef.current(rotationRef.current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        rotationRef.current = targetRotationRef.current;
        isSpinningRef.current = false;
        animationRef.current = null;
        onSpinCompleteRef.current();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null)
        cancelAnimationFrame(animationRef.current);
    };
  }, [mustSpin]);

  return (
    // Container drives responsive sizing via ResizeObserver.
    // aspect-square reserves the correct height before ResizeObserver fires,
    // preventing the collapse-then-expand layout shift on first paint.
    <div ref={containerRef} className="aspect-square w-full max-w-[420px]">
      <div className="relative flex items-center justify-center">
        {/* Minimal pointer triangle at top centre */}
        <div
          className="absolute top-0 left-1/2 z-10 -translate-x-1/2 -translate-y-1 drop-shadow-md"
          aria-hidden="true"
        >
          <div
            className="h-0 w-0"
            style={{
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderTop: "20px solid #ededed",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
            }}
          />
        </div>

        <canvas
          ref={canvasRef}
          aria-label="Spinning wheel"
          role="img"
          // width/height attributes are set imperatively via the ResizeObserver effect
        />
      </div>
    </div>
  );
}
