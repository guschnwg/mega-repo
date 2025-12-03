import React, { useState, useEffect, useRef, useCallback } from "react";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";

import { Clock } from "@/src/components/Clock";
import { styles } from "@/src/styles";
import { Timer } from "@/src/components/Timer";
import { OurButton } from "@/src/components/OurButton";
import { ScrollCenter } from "@/src/components/ScrollCenter";

interface WodEMOMProps {
  step: EMOMStepType;
  onEnd: (config: EMOMConfigType) => void;
}

interface EMOMStepProps {
  counter: EMOMConfigCounterType;
  onEnd: (counter: EMOMConfigCounterType) => void;
}

interface EMOMCounterLabelProps {
  isPast: boolean
  counter: EMOMConfigCounterType
}

const EMOMCounterLabel = ({ isPast, counter }: EMOMCounterLabelProps) => {
  if (!isPast) {
    return (
      <View
        style={{ flexDirection: 'column', alignItems: 'center' }}
      >
        <Text
          style={{
            color: styles.primary,
          }}
        >
          {counter.max} reps
        </Text>
        <Text>{counter.time / 1000}s</Text>
      </View>
    );
  }

  if (counter.value === counter.max) {
    return (
      <View
        style={{
          flexDirection: 'row',
        }}
      >
        <View
          style={{ flexDirection: 'column', alignItems: 'center' }}
        >
          <Text
            style={{
              color: styles.primary,
            }}
          >
            {counter.value} reps
          </Text>
          <View
            style={{ flexDirection: 'row' }}
          >
            <Text
              style={{
                color: styles.primary,
              }}
            >
              {(counter.history[counter.value - 1] / 1000).toFixed(1)}s
            </Text>
            <Text>/{counter.time / 1000}s</Text>
          </View>
        </View>
      </View>
    );
  } else {
    return (
      <View
        style={{
          flexDirection: 'row',
        }}
      >
        <View
          style={{ flexDirection: 'column', alignItems: 'center' }}
        >
          <Text
            style={{
              color: styles.primary,
            }}
          >
            {counter.value - counter.max} reps
          </Text>
          <Text>{counter.time / 1000}s</Text>
        </View>
      </View>
    );
  }
}

const EMOMStep = ({ counter, onEnd }: EMOMStepProps) => {
  const [count, setCount] = useState(0);
  const [history, setHistory] = useState<number[]>([]);
  const ref = useRef(false);

  const shouldVibrate = useCallback((prev: { start: number, current: number }, next: { start: number, current: number }) => {
    const prevDelta = prev.current - prev.start;
    const nextDelta = next.current - next.start;
    return nextDelta > (counter.time - 5000) && Math.floor(prevDelta / 1000) !== Math.floor(nextDelta / 1000);
  }, [counter.time]);

  return (
    <>
      <Timer
        shouldVibrate={shouldVibrate}
        onChange={(next) => {
          const actualCurrentMs = next.current - next.start;
          if (actualCurrentMs > counter.time && !ref.current) {
            ref.current = true;
            setTimeout(() => {
              onEnd({
                ...counter,
                history,
                value: count,
              });
            }, 100);
          }
        }}
      >
        {(start, current, minutes, seconds) => (
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
                max={counter.time}
                size={300}
                tickness={12}
                ticks={history}
                label={`${String(Math.floor(minutes)).padStart(2, "0")}:${String(Math.floor(seconds)).padStart(2, "0")}`}
              />
            </View>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 20,
              }}
            >
              {counter.max === count ? (
                <Text
                  style={{
                    fontSize: styles.fontSize * 2,
                  }}
                >
                  Rest time!
                </Text>
              ) : (
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
                    {counter.max - count} reps to go
                  </Text>
                  <OurButton
                    title="+ REP"
                    disabled={count === counter.max}
                    style={{
                      height: 80,
                      width: 80,
                      borderRadius: 50,
                    }}
                    onPress={() => {
                      setCount((prev) => prev + 1);
                      setHistory((prev) => [...prev, current - start]);
                    }}
                  />
                </View>
              )}
            </View>
          </View>
        )}
      </Timer>
    </>
  )
};

export const WodEMOM = ({ step, onEnd }: WodEMOMProps) => {
  const [current, setCurrent] = useState(0);
  const [counters, setCounters] = useState(step.config.counters);
  const dimensions = useWindowDimensions();
  const itemSize = dimensions.width / 5;

  return (
    <View
      style={{
        flex: 1,
      }}
    >
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

      <View
        style={{
          height: 100,
        }}
      >
        <ScrollCenter
          current={current}
          width={dimensions.width}
          itemSize={itemSize}
        >
          {counters.map((counter, index) => (
            <View
              key={index}
              style={{
                flexDirection: 'column',
                alignItems: 'center',
                opacity: current === index ? 1 : 0.5,
                width: itemSize,
                transform: [{ scale: index === current ? 1 : 0.7 }],
              }}
            >
              <Text>
                Set {index + 1}
              </Text>

              <EMOMCounterLabel
                isPast={index < current}
                counter={counter}
              />
            </View>
          ))}
        </ScrollCenter>
      </View>
    </View >
  );
};
