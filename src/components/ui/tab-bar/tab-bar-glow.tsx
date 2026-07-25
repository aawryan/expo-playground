import { memo } from "react";
import Svg, {
  ClipPath,
  Defs,
  LinearGradient,
  Polygon,
  Rect,
  Stop,
} from "react-native-svg";

import { colors } from "@/lib/theme/colors";
import {
  GLOW_HEIGHT,
  GLOW_WIDTH_BOTTOM_FALLBACK,
  GLOW_WIDTH_TOP_FALLBACK,
} from "./tab-bar.constants";

interface TabBarGlowProps {
  /** Bottom (icon-side) and top (indicator-side) widths, in px. Passed in
   * as a ratio of each tab's *measured* width so the halo keeps the same
   * proportional space around every icon regardless of screen size —
   * falls back to fixed values only for the first unmeasured frame. */
  widthBottom?: number;
  widthTop?: number;
}

function TabBarGlowBase({
  widthBottom = GLOW_WIDTH_BOTTOM_FALLBACK,
  widthTop = GLOW_WIDTH_TOP_FALLBACK,
}: TabBarGlowProps) {
  const width = widthBottom;
  const height = GLOW_HEIGHT;
  const half = width / 2;
  const topLeft = half - widthTop / 2;
  const topRight = half + widthTop / 2;

  // Narrow where it meets the indicator, wide where it reaches the icon —
  // a clip shape only; the actual color comes from a single, reliably-soft
  // vertical gradient (a RadialGradient with percentage cx/cy renders
  // inconsistently — near-solid — on some Android/Skia builds).
  const conePoints = `${topLeft},0 ${topRight},0 ${width},${height} 0,${height}`;

  return (
    <Svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      pointerEvents="none"
    >
      <Defs>
        <ClipPath id="cone">
          <Polygon points={conePoints} />
        </ClipPath>

        <LinearGradient id="beam" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={colors.glowEdge} stopOpacity={0} />
          <Stop offset="0.5" stopColor={colors.glowCore} stopOpacity={0.4} />
          <Stop offset="1" stopColor={colors.glowEdge} stopOpacity={0} />
        </LinearGradient>
      </Defs>

      <Rect
        x="0"
        y="0"
        width={width}
        height={height}
        fill="url(#beam)"
        clipPath="url(#cone)"
      />
    </Svg>
  );
}

export const TabBarGlow = memo(TabBarGlowBase);
