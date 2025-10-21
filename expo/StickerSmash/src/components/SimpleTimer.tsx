import React, { useEffect, useState } from 'react'
import { Clock } from './Clock'
import { View, Text } from 'react-native'
import { styles } from '../styles';

export const SimpleTimer = ({ onProgress }: { onProgress: (time: number) => void }) => {
  const [time, setTime] = useState<{ start: number, current: number }>({ start: Date.now(), current: Date.now() });

  useEffect(() => {
    const key = setInterval(() => {
      const nextTime = Date.now();
      setTime(prev => ({
        ...prev,
        current: nextTime,
      }));
      onProgress(nextTime - time.start);
    }, 50);

    return () => clearInterval(key);
  }, [time.start, onProgress]);

  const minutes = (time.current - time.start) / 1000 / 60;
  const seconds = (time.current - time.start) / 1000 % 60;

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Clock
        current={seconds}
        max={60}
        size={300}
        tickness={12}
      >
        <Text
          style={{
            fontSize: 48,
            color: styles.textDark
          }}
        >
          {String(Math.floor(minutes)).padStart(2, '0')}
          :
          {String(Math.floor(seconds)).padStart(2, '0')}
        </Text>
      </Clock>
    </View>
  )
}
