import React from "react";
import { Text, View } from "react-native";

import { styles } from '../styles';

const ChartGrid = ({ width, height, maxHeight, stepSize }: { width: number, height: number, maxHeight: number, stepSize: number }) => (
  <>
    {[...Array(Math.ceil(maxHeight / stepSize)).keys()].filter(i => i).map(i => (
      <View
        key={i}
        style={{
          position: 'absolute',
          bottom: height * i * stepSize / maxHeight - 1,
          left: 0,
          height: 1,
          width,
          backgroundColor: '#eee',
        }}
      >
        <Text
          style={{
            position: 'absolute',
            top: (height * i * stepSize / maxHeight - 1) > height - 10 ? -2 : -9,
            left: 2,
            fontSize: 8,
            color: '#bbb',
          }}
        >
          {i * stepSize}
        </Text>
      </View>
    ))}

    {[...Array(10).keys()].map((k, i) => (
      <View
        key={k}
        style={{
          width: i === 0 || i === 9 ? 2 : 1,
          backgroundColor: i === 0 || i === 9 ? styles.primary : '#bbb',
        }}
      />
    ))}
  </>
)

export const Chart = ({ height, width, counter, currentTime, endTime }: { counter: CounterType, currentTime: number, endTime: number, height: number, width: number }) => {
  const maxHeight = (counter.value < 30 ? 40 : counter.value + Math.round(counter.value / 5));
  const stepSize = counter.value > 80 ? 20 : counter.value > 40 ? 10 : 8;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'space-between',
        flexDirection: 'row',
        borderBlockColor: styles.primary,
        borderTopWidth: 2,
        borderBottomWidth: 2,
      }}
    >
      <ChartGrid
        width={width}
        height={height}
        maxHeight={maxHeight}
        stepSize={stepSize}
      />

      {counter.history.map((h, i) => (
        <View
          key={`${h}-${i}`}
          style={{
            position: 'absolute',
            height: 2,
            width: 2,
            borderRadius: 1,
            bottom: height * i / maxHeight + 1,
            left: width * h / (endTime * 1000) - 1,
            backgroundColor: 'purple'
          }}
        />
      ))}

      <View
        style={{
          position: 'absolute',
          height: height - 4,
          left: width * currentTime / (endTime * 1000),
          width: 2,
          backgroundColor: styles.secondary,
        }}
      />
    </View>
  )
}
