import React, { useState } from "react";
import { Text, useWindowDimensions, Vibration, View } from "react-native";

import { Clock } from "../Clock";
import { OurButton } from "../OurButton";
import { LayoutAware } from "../LayoutAware";
import { Chart } from "../Chart";
import { styles } from "../../styles";

interface WodAmrapProps {
  time: number;
  onEnd: (counter: CounterType) => void;
  onStop: () => void;
}

export const WodAmrap = ({ time, onEnd, onStop }: WodAmrapProps) => {
  const begin = (crr?: number, counter?: CounterType): TimerType => {
    return {
      counter: counter || {
        value: 0,
        history: [],
      },
      prev: Date.now(),
      crr: crr || 0,
      key: setInterval(() => {
        setTimer((crr) => {
          const newTime = Date.now();
          const next = crr.crr + (newTime - crr.prev);
          let key = crr.key;
          if (next >= time * 1000) {
            clearInterval(crr.key!);
            setTimeout(() => onEnd(crr.counter), 100);
            key = null;
          }
          return { counter: crr.counter, prev: newTime, crr: next, key: key };
        });
      }, 10),
    };
  };

  const [timer, setTimer] = useState<TimerType>(() => begin());
  const dimensions = useWindowDimensions();

  const pause = () => {
    setTimer((crr) => {
      clearInterval(crr.key!);
      return { ...crr, key: null };
    });
  };

  const resume = () => {
    setTimer((prev) => begin(prev.crr, prev.counter));
  };

  const minutes = timer.crr / 1000 / 60;
  const seconds = (timer.crr / 1000) % 60;

  const timeLeft = time - timer.crr / 1000;
  return (
    <View
      style={{
        flex: 1,
        gap: 20,
        backgroundColor:
          timeLeft < 5 ? `rgba(255, 0, 0, ${timeLeft % 1})` : "transparent",
        flexDirection: dimensions.height > dimensions.width ? "column" : "row",
      }}
    >
      <View
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          right: 20,
          flex: 1,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        <OurButton title="Stop" onPress={onStop} />

        <OurButton
          title={timer.key ? "Pause" : "Continue"}
          onPress={timer.key ? pause : resume}
        />
      </View>

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          flexDirection:
            dimensions.height > dimensions.width ? "row" : "column",
          gap: 20,
        }}
      >
        <Clock current={seconds} max={time}>
          <Text style={{ fontSize: 48, color: styles.textDark }}>
            {String(Math.floor(minutes)).padStart(2, "0")}:
            {String(Math.floor(seconds)).padStart(2, "0")}
          </Text>
        </Clock>
      </View>

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
        onTouchEnd={() => {
          if (!timer.key) return;

          Vibration.vibrate(10);

          setTimer((crr) => ({
            ...crr,
            counter: {
              value: crr.counter.value + 1,
              history: [...crr.counter.history, crr.crr],
            },
          }));
        }}
      >
        <Text
          style={{
            fontSize: 128,
            marginBlock: "auto",
            color: styles.textDark,
            opacity: timer.key ? 1 : 0.1,
          }}
        >
          {timer.counter.value}
        </Text>

        <View
          style={{
            padding: 10,
            alignSelf: "stretch",
            opacity: timer.key ? 1 : 0.1,
          }}
        >
          <LayoutAware height={100}>
            {({ ready, width, height }) =>
              ready && (
                <Chart
                  height={height}
                  width={width}
                  counter={timer.counter}
                  currentTime={timer.crr}
                  endTime={time}
                />
              )
            }
          </LayoutAware>
        </View>

        {!timer.key && (
          <View
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: "100%",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
            onTouchEnd={resume}
          >
            <Text
              style={{
                fontSize: 48,
                color: styles.textDark,
              }}
            >
              Paused
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};
