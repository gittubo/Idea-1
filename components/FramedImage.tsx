"use client";

import type { Artwork } from "@/data/types";
import { imageTransform, type CameraPose, type Viewport } from "@/engine/camera-controller";

/**
 * The master image drawn as the camera sees it. The artwork itself is never altered:
 * the camera only moves and scales over it. The detail tile, when present, sits in the
 * same coordinate space so close-ups stay sharp.
 */
export function FramedImage({
  artwork,
  pose,
  viewport,
  priority = false,
}: {
  artwork: Artwork;
  pose: CameraPose;
  viewport: Viewport;
  priority?: boolean;
}) {
  const { master, mobile, detail } = artwork.media;
  const t = imageTransform(pose, viewport, master);
  // The smaller rendition is enough until the camera is close or the screen is large.
  const src = viewport.width * Math.min(2, typeof window === "undefined" ? 1 : window.devicePixelRatio) > 1600 ? master.src : mobile.src;
  const showDetail = detail && t.scale * (master.width / mobile.width) > 1.05;

  return (
    <div
      className="framed-image"
      style={{
        width: master.width,
        height: master.height,
        transform: `translate3d(${t.tx}px, ${t.ty}px, 0) scale(${t.scale})`,
      }}
    >
      <img src={src} alt="" width={master.width} height={master.height} fetchPriority={priority ? "high" : "auto"} draggable={false} />
      {detail && (
        <img
          src={detail.src}
          alt=""
          className="framed-image__detail"
          style={{
            left: detail.region.x,
            top: detail.region.y,
            width: detail.region.width,
            height: detail.region.height,
            opacity: showDetail ? 1 : 0,
          }}
          loading={priority ? "eager" : "lazy"}
          draggable={false}
        />
      )}
    </div>
  );
}
