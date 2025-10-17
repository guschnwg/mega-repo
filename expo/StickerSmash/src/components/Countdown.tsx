import React, { useState, useEffect } from "react";
import { Text } from "react-native";

import { Clock } from "./Clock";

export function Countdown({ time, onFinish }: { time: number; onFinish: () => void; }) {
  const [timeLeft, setTimeLeft] = useState({ start: Date.now(), left: time * 1000 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const left = Math.max((time * 1000) - (now - timeLeft.start), 0);
      if (left === 0) {
        clearInterval(interval);
        return onFinish();
      }
      setTimeLeft({ start: timeLeft.start, left });
    }, 10);

    return () => {
      clearInterval(interval);
    };
  }, [timeLeft.start, time, onFinish]);

  const secondsLeft = timeLeft.left / 1000;
  const msLeft = timeLeft.left % 1000;
  return (
    <Clock size={300} tickness={12} current={secondsLeft} max={time}>
      <Text style={{ fontSize: 48 }}>
        00:
        {String(Math.floor(secondsLeft)).padStart(2, '0')}
        .
        {String(msLeft).padStart(3, '0')}
      </Text>
    </Clock>
  );
}
