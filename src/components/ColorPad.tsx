import type { CSSProperties } from "react";
import type { PadConfig } from "../game/constants";

interface ColorPadProps {
  pad: PadConfig;
  position: 0 | 1 | 2 | 3; // TL, TR, BL, BR
  active: boolean;
  error: boolean;
  enabled: boolean;
  onPress: (id: number) => void;
}

/** radius + glow origin for each quadrant so the four pads form a ring */
const QUADRANT: Record<
  number,
  { radius: string; gx: string; gy: string; ox: string; oy: string; labelPos: string }
> = {
  0: {
    radius: "100% 14% 14% 14% / 100% 14% 14% 14%",
    gx: "70%",
    gy: "70%",
    ox: "100%",
    oy: "100%",
    labelPos: "right-[14%] bottom-[12%]",
  },
  1: {
    radius: "14% 100% 14% 14% / 14% 100% 14% 14%",
    gx: "30%",
    gy: "70%",
    ox: "0%",
    oy: "100%",
    labelPos: "left-[14%] bottom-[12%]",
  },
  2: {
    radius: "14% 14% 14% 100% / 14% 14% 14% 100%",
    gx: "70%",
    gy: "30%",
    ox: "100%",
    oy: "0%",
    labelPos: "right-[14%] top-[12%]",
  },
  3: {
    radius: "14% 14% 100% 14% / 14% 14% 100% 14%",
    gx: "30%",
    gy: "30%",
    ox: "0%",
    oy: "0%",
    labelPos: "left-[14%] top-[12%]",
  },
};

export function ColorPad({
  pad,
  position,
  active,
  error,
  enabled,
  onPress,
}: ColorPadProps) {
  const q = QUADRANT[position];
  const style = {
    "--pad": pad.color,
    "--pad-light": pad.light,
    "--gx": q.gx,
    "--gy": q.gy,
    "--ox": q.ox,
    "--oy": q.oy,
    borderRadius: q.radius,
  } as CSSProperties;

  return (
    <button
      type="button"
      className="pad"
      style={style}
      data-active={active}
      data-error={error}
      data-enabled={enabled}
      aria-label={`${pad.name} pad (key ${pad.key})`}
      aria-disabled={!enabled}
      onPointerDown={(e) => {
        // pointerdown gives snappier feedback than click on touch devices
        if (e.button !== 0 && e.pointerType === "mouse") return;
        if (!enabled) return;
        onPress(pad.id);
      }}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && enabled) {
          e.preventDefault();
          onPress(pad.id);
        }
      }}
    >
      <span className={`pad-label ${q.labelPos}`}>{pad.key}</span>
    </button>
  );
}
