import type { CSSProperties, ReactNode } from "react";

/**
 * A believable room built from five CSS 3D planes. The visitor's camera sits at the
 * open end; `advance` moves it forward (px along the room's depth). The room's near
 * edges meet the screen's edges, so the architecture always fills the view.
 */
export function Room({
  variant,
  advance,
  durationMs = 1800,
  depth = 3000,
  backWall,
  leftWall,
  rightWall,
  className,
}: {
  variant: "entrance" | "hall" | "gallery";
  advance: number;
  durationMs?: number;
  depth?: number;
  backWall?: ReactNode;
  leftWall?: ReactNode;
  rightWall?: ReactNode;
  className?: string;
}) {
  const style = {
    "--depth": `${depth}px`,
    "--advance": `${advance}px`,
    "--travel": `${durationMs}ms`,
  } as CSSProperties;
  return (
    <div className={`room room--${variant} ${className ?? ""}`} style={style}>
      <div className="room__space">
        <div className="room__plane room__floor" />
        <div className="room__plane room__ceiling" />
        <div className="room__plane room__wall room__wall--left">{leftWall}</div>
        <div className="room__plane room__wall room__wall--right">{rightWall}</div>
        <div className="room__plane room__back">{backWall}</div>
      </div>
      <div className="room__atmosphere" aria-hidden="true" />
    </div>
  );
}
