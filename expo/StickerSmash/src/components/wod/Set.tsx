import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  useWindowDimensions,
  ScrollView,
} from "react-native";

import { Clock } from "@/src/components/Clock";
import { styles } from "@/src/styles";
import { OurButton } from "@/src/components/OurButton";
import { ScrollCenter } from "@/src/components/ScrollCenter";
import { Timer } from "@/src/components/Timer";

interface WodSetProps {
  step: SetStepType;
  onEnd: (config: SetConfigType) => void;
}

const SetStep = ({
  counter,
  onFinish,
}: {
  counter: CounterType;
  onFinish: (counter: CounterType) => void;
}) => {
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState<number[]>([]);

  return (
    <Timer>
      {(start, current, minutes, seconds) => {
        return (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: styles.background,
            }}
          >
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock
                current={current - start}
                max={60000}
                size={300}
                tickness={12}
                ticks={history}
                label={`${String(Math.floor(minutes)).padStart(2, "0")}:${String(Math.floor(seconds)).padStart(2, "0")}`}
              />
            </View>

            <View
              style={{
                gap: 20,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: styles.fontSize * 2,
                }}
              >
                {count} reps
              </Text>
              <OurButton
                title="+ REP"
                style={{
                  height: 80,
                  width: 80,
                  borderRadius: 50,
                }}
                onPress={() => {
                  if (count + 1 === counter.max) {
                    onFinish({
                      ...counter,
                      history: [...history, current - start],
                      value: count + 1,
                    });
                  } else {
                    setCount(prev => prev + 1);
                    setHistory((prev) => [...prev, current - start]);
                  }
                }}
                onLongPress={() => {
                  onFinish({
                    ...counter,
                    history,
                    value: counter.max!,
                  });
                }}
              />
            </View>
          </View>
        )
      }}
    </Timer>
  )
};

const SetWait = ({
  onWaited,
}: {
  onWaited: (time: number) => void
}) => {
  return (
    <Timer>
      {(start, current, minutes, seconds) => {
        return (
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: styles.background,
            }}
          >
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock
                current={current - start}
                max={60000}
                size={300}
                tickness={12}
                label={`${String(Math.floor(minutes)).padStart(2, "0")}:${String(Math.floor(seconds)).padStart(2, "0")}`}
              />
            </View>

            <OurButton
              title="Let's go"
              onPress={() => onWaited(Date.now() - start)}
            />
          </View>
        )
      }}
    </Timer>
  )
};

export const WodSet = ({ step, onEnd }: WodSetProps) => {
  const [counters, setCounters] = useState(step.config.counters);
  const [waits, setWaits] = useState<number[]>([]);
  const dimensions = useWindowDimensions();
  const [current, setCurrent] = useState(0);
  const ref = useRef<ScrollView | null>(null);
  const itemSize = dimensions.width / 5;

  useEffect(() => {
    ref.current?.scrollTo({
      x: 0,
      y: (dimensions.height / 2) * (current * 2),
      animated: true,
    });
  }, [ref, current, dimensions]);

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <View
        style={{
          flex: 1,
        }}
      >
        {current % 1 === 0 ? (
          <SetStep
            key={current}
            counter={counters[current]}
            onFinish={(updated) => {
              setCounters((prev) => {
                prev[current] = updated;
                return [...prev];
              });
              setCurrent((prev) => prev + 0.5);
            }}
          />
        ) : (
          <SetWait
            key={current}
            onWaited={(time) => {
              if (current > counters.length - 1) {
                onEnd({
                  ...step.config,
                  counters,
                  waits: [...waits, time],
                });
              } else {
                setWaits((prev) => [...prev, time]);
                setCurrent((prev) => prev + 0.5);
              }
            }}
          />
        )}
      </View>

      <View
        style={{
          height: 100,
        }}
      >
        <ScrollCenter
          current={current * 2}
          width={dimensions.width}
          itemSize={itemSize}
        >
          {counters.map((counter, index) => (
            <React.Fragment key={index}>
              <View
                style={{
                  flexDirection: 'column',
                  alignItems: 'center',
                  opacity: current === index ? 1 : 0.5,
                  width: itemSize,
                  transform: [{ scale: current === index ? 1 : 0.7 }],
                }}
              >
                <Text>
                  Set {index + 1}
                </Text>
                <Text>
                  {counter.max} reps
                </Text>
              </View>

              {index !== counters.length - 1 ? (
                <View
                  style={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    opacity: current === index + 0.5 ? 1 : 0.5,
                    width: itemSize,
                    transform: [{ scale: current === index + 0.5 ? 1 : 0.7 }],
                  }}
                >
                  <Text>
                    Wait
                  </Text>
                </View>
              ) : (
                <View
                  style={{
                    flexDirection: 'column',
                    alignItems: 'center',
                    opacity: current === index + 0.5 ? 1 : 0.5,
                    width: itemSize,
                    transform: [{ scale: current === index + 0.5 ? 1 : 0.7 }],
                  }}
                >
                  <Text>
                    Complete
                  </Text>
                </View>
              )}
            </React.Fragment>
          ))}
        </ScrollCenter>
      </View>
    </View>
  );
};
