import React from "react";
import { Svg, Circle, Text } from "react-native-svg";
import { styles } from "../styles";

interface Props {
  current: number;
  size?: number;
  tickness?: number;
  max: number;
  label?: string;
  ticks?: number[];
}

export function Clock({
  current,
  size = 200,
  tickness = 4,
  max,
  label,
  ticks = [],
}: Props) {
  const dashArray = size * 3;
  const offset = (current / max) % 1;
  const dashOffset = Math.floor(dashArray - offset * dashArray);
  const fontSize = size / 6;

  const round = Math.floor(current / max);
  const color1 = round % 2 === 0 ? styles.secondary : styles.primary;
  const color2 = round % 2 === 1 ? styles.secondary : styles.primary;
  const indicatorColor =
    round % 2 === 0 ? styles.secondaryDark : styles.primaryDark;
  const tickColor = round % 2 === 0 ? styles.secondaryDark : styles.primaryDark;

  return (
    <Svg
      width={size}
      height={size}
      style={{ transform: [{ rotate: "-90deg" }] }}
    >
      <Circle
        r={size / 2 - tickness / 2}
        cx={size / 2}
        cy={size / 2}
        fill="transparent"
        stroke={color2}
        strokeWidth={tickness}
      />
      <Circle
        r={size / 2 - tickness / 2}
        cx={size / 2}
        cy={size / 2}
        stroke={indicatorColor}
        strokeWidth={tickness}
        strokeLinecap="butt"
        strokeDashoffset={dashOffset}
        fill="transparent"
        strokeDasharray={dashArray}
      />
      <Circle
        r={size / 2 - tickness / 2}
        cx={size / 2}
        cy={size / 2}
        stroke={color1}
        strokeWidth={tickness}
        strokeLinecap="butt"
        strokeDashoffset={dashOffset + 3}
        fill="transparent"
        strokeDasharray={dashArray}
      />
      {ticks.map((t) => {
        const angle = (t / max) * Math.PI * 2;

        const x = (size / 2 - tickness / 2) * Math.cos(angle);
        const y = (size / 2 - tickness / 2) * Math.sin(angle);

        return (
          <Circle
            key={t}
            r={tickness / 2}
            cx={size / 2 + x}
            cy={size / 2 + y}
            fill={tickColor}
          />
        );
      })}
      {label && (
        <Text
          x="50%"
          y="50%"
          textAnchor="middle"
          alignmentBaseline="middle"
          fill={styles.textDark}
          fontSize={fontSize}
          fontWeight="bold"
          transform={`rotate(90) translate(0, -${size - fontSize / 8})`}
        >
          {label}
        </Text>
      )}
    </Svg>
  );
}
