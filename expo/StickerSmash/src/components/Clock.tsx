import React from "react";
import { View } from "react-native";
import { styles } from "../styles";

export function Clock({ current, size = 200, tickness = 4, max, children }: React.PropsWithChildren<{ current: number, size?: number, tickness?: number, max: number }>) {
  const percentage = current / max;
  const radFromDeg = (deg: number) => (deg - 180) * (Math.PI / 180);
  const percentageAngle = radFromDeg(percentage * 360);

  const halfSize = size / 2;
  const halfTickness = tickness / 2;
  const stepSize = size / 50; // IDK to be honest,
  const halfStepSize = stepSize / 2;

  const round = Math.floor(current / max);
  const color1 = round % 2 === 0 ? styles.secondary : styles.primary;
  const color2 = round % 2 === 1 ? styles.secondary : styles.primary;
  const indicatorColor = round % 2 === 0 ? styles.secondaryDark : styles.primaryDark;
  const normalizedPct = percentage % 1;

  return (
    <View
      style={{
        height: size,
        width: size,
        borderRadius: halfSize,
        position: 'relative',
      }}
    >
      {[...Array(180).keys()].map(v => v * 2).reverse().map(i => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: halfSize + (halfSize - halfStepSize) * Math.sin(radFromDeg(i)) - halfStepSize,
            left: halfSize + (halfSize - halfTickness) * Math.cos(radFromDeg(i)) - halfTickness,
            height: stepSize,
            width: tickness,
            backgroundColor: i / 360 < normalizedPct ? color1 : color2,
            transform: [{ rotate: `${i}deg` }]
          }}
        />
      ))}

      <View
        style={{
          position: 'absolute',
          top: halfSize + (halfSize - halfStepSize) * Math.sin(percentageAngle) - halfStepSize,
          left: halfSize + (halfSize - halfTickness) * Math.cos(percentageAngle) - halfTickness,
          height: stepSize,
          width: tickness,
          backgroundColor: indicatorColor,
          transform: [{ rotate: `${percentageAngle}rad` }]
        }}
      />

      <View
        style={{
          position: 'absolute',
          top: stepSize,
          left: tickness,
          height: size - stepSize * 2,
          width: size - tickness * 2,
          borderRadius: halfTickness - size,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </View>
    </View>
  );
}
