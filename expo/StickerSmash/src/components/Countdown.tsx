import React, {
  useState,
  useEffect,
  useCallback,
  useReducer,
  useRef,
} from "react";
import { Text, View } from "react-native";

import { Clock } from "@/src/components/Clock";
import { Timer } from "@/src/components/Timer";
import { styles } from "@/src/styles";

interface CountdownProps {
  time: number;
  onFinish: () => void;
}

export function Countdown({ time, onFinish }: CountdownProps) {
  const ref = useRef(false);

  const shouldVibrate = useCallback(
    (
      prev: { start: number; current: number },
      next: { start: number; current: number },
    ) => {
      const prevDelta = prev.current - prev.start;
      const nextDelta = next.current - next.start;
      return Math.floor(prevDelta / 1000) !== Math.floor(nextDelta / 1000);
    },
    [],
  );

  return (
    <Timer
      shouldVibrate={shouldVibrate}
      onChange={(next) => {
        if (next.current - next.start > time && !ref.current) {
          ref.current = true;
          setTimeout(() => {
            onFinish();
          }, 100);
        }
      }}
    >
      {(start, current, minutes, seconds) => {
        const timeLeft = Math.max(time - (current - start), 0);
        const secondsLeft = timeLeft / 1000;
        const msLeft = timeLeft % 1000;
        return (
          <Clock
            size={300}
            tickness={12}
            current={timeLeft}
            max={time}
            label={`00:${String(Math.floor(secondsLeft)).padStart(2, "0")}.${String(msLeft).padStart(3, "0")}`}
          />
        );
      }}
    </Timer>
  );
}
