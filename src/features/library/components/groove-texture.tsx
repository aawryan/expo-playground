import Svg, { Defs, Line, Pattern, Rect } from "react-native-svg";

interface GrooveTextureProps {
  /** Line color — callers pass a low-opacity white/black depending on
   * how much contrast the tile underneath it needs. */
  color: string;
}

/** Fills its parent with a repeating field of fine diagonal lines, like
 * grooves on a record or ribbing on an album sleeve. Purely decorative,
 * absolutely positioned, non-interactive. */
export function GrooveTexture({ color }: GrooveTextureProps) {
  return (
    <Svg
      width="100%"
      height="100%"
      style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <Defs>
        <Pattern
          id="grooveLines"
          patternUnits="userSpaceOnUse"
          width={7}
          height={7}
          patternTransform="rotate(45)"
        >
          <Line x1="0" y1="0" x2="0" y2="7" stroke={color} strokeWidth={1} />
        </Pattern>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#grooveLines)" />
    </Svg>
  );
}
