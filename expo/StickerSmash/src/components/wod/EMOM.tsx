import React, { useState, useEffect, useRef } from "react";
import { Pressable, Text, View } from "react-native";
import { Clock } from "../Clock";
import { styles } from "@/src/styles";

interface WodEMOMProps {
  step: EMOMStepType;
  onEnd: (config: EMOMConfigType) => void;
}

const EMOMStep = ({
  counter,
  onEnd,
}: {
  counter: EMOMConfigCounterType;
  onEnd: (counter: EMOMConfigCounterType) => void;
}) => {
  const [timer, setTimer] = useState<{
    key: number | null;
    start: number;
    current: number;
  }>({
    key: null,
    start: 0,
    current: 0,
  });

  const [count, setCount] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const ref = useRef(false);

  useEffect(() => {
    if (!timer.key) {
      setTimer((prev) => ({
        ...prev,
        start: Date.now(),
        key: setInterval(() => {
          setTimer((prev) => ({
            ...prev,
            current: Date.now() - prev.start,
          }));
        }, 100),
      }));
    }

    return () => {
      if (timer.key) {
        clearInterval(timer.key);
      }
    };
  }, [timer.key]);

  const minutes = timer.current / 60000;
  const seconds = timer.current / 1000;

  if (timer.current / 1000 > counter.time && !ref.current) {
    ref.current = true;
    setTimeout(() => {
      onEnd({
        ...counter,
        history,
        value: count,
      });
    }, 100);
  }

  return (
    <Pressable
      style={{
        height: 300,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
      disabled={count === counter.max}
      onPress={() => {
        setCount((prev) => prev + 1);
        setHistory((prev) => [...prev, timer.current]);
      }}
    >
      <Clock size={300} current={timer.current / 1000} max={counter.time}>
        <Text
          style={{
            fontSize: 48,
          }}
        >
          {count}/{counter.max}
        </Text>

        <Text style={{ fontSize: 48, color: styles.textDark }}>
          {String(Math.floor(minutes)).padStart(2, "0")}:
          {String(Math.floor(seconds)).padStart(2, "0")}
        </Text>
      </Clock>
    </Pressable>
  );
};

export const WodEMOM = ({ step, onEnd }: WodEMOMProps) => {
  const [current, setCurrent] = useState(0);
  const [counters, setCounters] = useState(step.config.counters);

  return (
    <View
      style={{
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
      }}
    >
      <View
        style={{
          gap: 10,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {counters.map((counter, index) => (
          <View
            key={index}
            style={{
              opacity: current === index ? 1 : 0.5,
            }}
          >
            <Clock
              size={60}
              current={
                (counter.history[counter.history.length - 1] || 0) / 1000
              }
              max={counter.time}
            >
              <Text
                style={{
                  textAlign: "center",
                  textAlignVertical: "center",
                }}
              >
                {counter.value
                  ? `${counter.value} in ${(counter.history[counter.history.length - 1] / 1000).toFixed(1)}s`
                  : `${counter.max} in ${counter.time}s`}
              </Text>
            </Clock>
          </View>
        ))}
      </View>
      <EMOMStep
        key={current}
        counter={counters[current]}
        onEnd={(updated) => {
          if (current === counters.length - 1) {
            onEnd({ counters });
          } else {
            counters[current] = updated;
            setCounters(counters);
            setCurrent((prev) => prev + 1);
          }
        }}
      />
    </View>
  );
};
