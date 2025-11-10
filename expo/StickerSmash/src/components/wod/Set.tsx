import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  ScrollView,
  Pressable,
} from "react-native";
import { Clock } from "../Clock";
import { styles } from "@/src/styles";
import { Holdable } from "../Holdable";

interface WodSetProps {
  step: SetStepType;
  onEnd: (config: SetConfigType) => void;
}

const SetStep = ({
  counter,
  active,
  onFinish,
}: {
  counter: CounterType;
  active: boolean;
  onFinish: (counter: CounterType) => void;
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
  const dimensions = useWindowDimensions();
  const [repTimes, setRepTimes] = useState<number[]>([]);

  useEffect(() => {
    if (!active) {
      if (timer.key) {
        clearInterval(timer.key);
        setTimer((prev) => ({ ...prev, key: null }));
      }
    } else {
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
    }
    return () => {
      if (timer.key) {
        clearInterval(timer.key);
      }
    };
  }, [active, timer.key]);

  const minutes = timer.current / 60000;
  const seconds = timer.current / 1000;

  return (
    <Pressable
      style={{
        height: dimensions.height / 2,
        opacity: active ? 1 : 0.5,
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}
      disabled={!active}
      onPress={() => {
        setRepTimes((prev) => [...prev, timer.current]);
        if (repTimes.length + 1 === counter.max) {
          onFinish({
            ...counter,
            history: repTimes,
            value: counter.max,
          });
        }
      }}
    >
      <Clock current={timer.current / 1000} max={60}>
        <Text style={{ fontSize: 48, color: styles.textDark }}>
          {String(Math.floor(minutes)).padStart(2, "0")}:
          {String(Math.floor(seconds)).padStart(2, "0")}
        </Text>
      </Clock>

      <Text style={{ fontSize: 48, color: styles.textDark }}>
        {repTimes.length}/{counter.max}
      </Text>
    </Pressable>
  );
};

const SetWait = ({
  active,
  onWaited,
}: {
  active: boolean;
  onWaited: (time: number) => void;
}) => {
  const dimensions = useWindowDimensions();
  const [start] = useState(Date.now());

  return (
    <Holdable
      time={1000}
      disabled={!active}
      indicator={true}
      style={{
        height: dimensions.height / 2,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "red",
      }}
      onHold={() => onWaited(Date.now() - start)}
    >
      <Text
        style={{
          fontSize: 24,
          textAlign: "center",
          textAlignVertical: "center",
        }}
      >
        Wait!!!!
      </Text>
      <Text>Hold to continue</Text>
    </Holdable>
  );
};

export const WodSet = ({ step, onEnd }: WodSetProps) => {
  const [counters, setCounters] = useState(step.config.counters);
  const [waits, setWaits] = useState<number[]>([]);
  const dimensions = useWindowDimensions();
  const [current, setCurrent] = useState(0);
  const ref = useRef<ScrollView | null>(null);

  useEffect(() => {
    ref.current?.scrollTo({
      x: 0,
      y: (dimensions.height / 2) * (current * 2),
      animated: true,
    });
  }, [ref, current, dimensions]);

  return (
    <ScrollView
      ref={ref}
      style={{
        flex: 1,
        flexDirection: "column",
      }}
      scrollEnabled={false}
    >
      <View
        style={{
          height: dimensions.height / 4,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 24 }}>
          Sets of{" "}
          {counters
            .slice(0, -1)
            .map((c) => c.max)
            .join(", ")}{" "}
          and {counters[counters.length - 1].max}
        </Text>
      </View>
      {counters.map((counter, index) => (
        <React.Fragment key={index}>
          <SetStep
            key={index}
            counter={counter}
            active={current === index}
            onFinish={(updated) => {
              setCounters((prev) => {
                prev[index] = updated;
                return [...prev];
              });
              if (current + 1 === counters.length) {
                onEnd({
                  ...step.config,
                  counters,
                  waits,
                });
              } else {
                setCurrent((prev) => prev + 0.5);
              }
            }}
          />
          {index !== counters.length - 1 && (
            <SetWait
              active={current === index + 0.5}
              onWaited={(time) => {
                setCurrent((prev) => prev + 0.5);
                setWaits((prev) => [...prev, time]);
              }}
            />
          )}
        </React.Fragment>
      ))}
      <View
        style={{
          height: dimensions.height / 4,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ fontSize: 24 }}>The End</Text>
      </View>
    </ScrollView>
  );
};
