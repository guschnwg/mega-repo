import React, { useEffect, useState } from 'react'
import { Vibration } from 'react-native'
import { OurButton } from './OurButton'

interface State {
  start: number
  current: number
}

interface Props {
  shouldVibrate?: (prev: State, next: State) => boolean
  onChange?: (next: State) => void
  children: (start: number, current: number, minutes: number, seconds: number) => React.ReactNode
}

export const Timer = ({ shouldVibrate, children, onChange }: Props) => {
  const [time, setTime] = useState<State>({ start: Date.now(), current: Date.now() });

  useEffect(() => {
    const key = setInterval(() => {
      const nextTime = Date.now();
      const next = { start: time.start, current: nextTime };
      onChange?.(next);
      setTime(prev => {
        if (shouldVibrate && shouldVibrate(prev, next)) {
          Vibration.vibrate(100);
        }
        return next;
      });
    }, 10);

    return () => {
      clearInterval(key);
    };
  }, [shouldVibrate, time.start, onChange]);


  const minutes = (time.current - time.start) / 1000 / 60;
  const seconds = (time.current - time.start) / 1000 % 60;

  return children(time.start, time.current, minutes, seconds);
}
