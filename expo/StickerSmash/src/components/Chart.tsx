import React from "react";
import { Text, View } from "react-native";

import { styles } from '../styles';

interface ChartGridProps {
  width: number
  height: number
  maxHeight: number
  stepSize: number
  endTime: number
  showHint?: boolean
}

const ChartGrid = ({ width, height, maxHeight, stepSize, endTime, showHint = false }: ChartGridProps) => (
  <>
    {[...Array(Math.ceil(maxHeight / stepSize)).keys()].filter(i => i).map(i => (
      <View
        key={i}
        style={{
          position: 'absolute',
          bottom: height * i * stepSize / maxHeight - 0.5,
          left: 0,
          height: 1,
          width,
          backgroundColor: '#eee',
        }}
      >
        {showHint && (
          <Text
            style={{
              position: 'absolute',
              top: (height * i * stepSize / maxHeight - 2) > height - 10 ? -2 : -9,
              left: 0,
              fontSize: 8,
              color: '#bbb',
            }}
          >
            {i * stepSize}
          </Text>
        )}
      </View>
    ))}

    {[...Array(11).keys()].map((k, i) => (
      <View
        key={k}
        style={{
          width: i === 0 || i === 10 ? 0 : 1,
          backgroundColor: i === 0 || i === 10 ? undefined : '#bbb',
        }}
      >
        {!showHint || i === 0 || i === 10 ? null : (
          <Text
            style={{
              position: 'absolute',
              top: -2,
              width: width / 10,
              left: 2,
              fontSize: 8,
              color: '#bbb',
            }}
          >
            {endTime / 1_000 / 10 * i}
          </Text>
        )}
      </View>
    ))}
  </>
)

interface ChartProps {
  counter: CounterType
  currentTime?: number
  endTime: number
  height: number
  width: number
  showGridHint?: boolean
  absoluteMax?: boolean
}

export const Chart = ({ showGridHint = false, absoluteMax = false, height: _height, width: _width, counter, currentTime, endTime }: ChartProps) => {
  const maxHeight = absoluteMax ? (counter.max || counter.value) : currentTime === endTime ? counter.value : (counter.value < 30 ? 40 : counter.value + Math.round(counter.value / 5));
  const stepSize = counter.value > 80 ? 20 : counter.value > 40 ? 10 : 8;

  const width = _width - 4;
  const height = _height - 4;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'space-between',
        flexDirection: 'row',
        borderColor: styles.primaryDark,
        borderWidth: 2,
      }}
    >
      <ChartGrid
        width={width}
        height={height}
        maxHeight={maxHeight}
        stepSize={stepSize}
        endTime={endTime}
        showHint={showGridHint}
      />

      {counter.history.map((h, i) => {
        const left = width * h / endTime;
        return (
          <View
            key={`${h}-${i}`}
            style={{
              position: 'absolute',
              height: height / maxHeight * (i + 1),
              width: width - left,
              bottom: 0,
              left,
              backgroundColor: [styles.secondary, styles.secondaryDark][i % 2],
              // backgroundColor: ['red', 'green', 'blue', 'purple', 'yellow'][i % 5],
            }}
          />
        )
      })}

      {currentTime && (
        <View
          style={{
            position: 'absolute',
            height: height,
            left: width * currentTime / 1000,
            width: 2,
            backgroundColor: styles.secondary,
          }}
        />
      )}
    </View>
  )
}
