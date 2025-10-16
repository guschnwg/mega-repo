import React from "react";
import { View } from "react-native";

export function Clock({ current, max, children }: React.PropsWithChildren<{ current: number; max: number; }>) {
  const percentage = current / max;
  const radFromDeg = (deg: number) => (deg - 180) * (Math.PI / 180);
  const percentageAngle = radFromDeg(percentage * 360);

  return (
    <View
      style={{
        height: 200,
        width: 200,
        borderRadius: 100,
        position: 'relative',
      }}
    >
      {[...Array(180).keys()].map(v => v * 2).reverse().map(i => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: 100 + 98 * Math.sin(radFromDeg(i)) - 2,
            left: 100 + 98 * Math.cos(radFromDeg(i)) - 2,
            height: 4,
            width: 4,
            backgroundColor: i / 360 < percentage ? 'blue' : 'white',
            transform: [{ rotate: `${i}deg` }]
          }} />
      ))}

      <View
        style={{
          position: 'absolute',
          top: 100 + 98 * Math.sin(percentageAngle) - 2,
          left: 100 + 98 * Math.cos(percentageAngle) - 2,
          height: 4,
          width: 4,
          backgroundColor: 'purple',
          transform: [{ rotate: `${percentageAngle}rad` }]
        }} />

      <View
        style={{
          position: 'absolute',
          top: 4,
          left: 4,
          height: 192,
          width: 192,
          borderRadius: 96,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </View>
    </View>
  );
}
