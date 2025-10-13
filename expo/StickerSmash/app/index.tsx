import React, { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";

interface Timer {
  prev: number
  crr: number
  key: NodeJS.Timeout | null
}

function Clock({ current, max, children }: React.PropsWithChildren<{ current: number, max: number }>) {
  const percentage = current / max;

  return (
    <View
      style={{
        height: 200,
        width: 200,
        borderRadius: 100,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {[...Array(360).keys()].reverse().map(i => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: 100 + 98 * Math.sin((i - 180) * (Math.PI / 180)) - 5,
            left: 100 + 98 * Math.cos((i - 180) * (Math.PI / 180)) - 5,
            height: 10,
            width: 10,
            borderRadius: 5,
            backgroundColor: i / 360 < percentage ? 'blue' : 'white',
          }}
        />
      ))}

      <View
        style={{
          position: 'absolute',
          top: 4,
          left: 4,
          height: 192,
          width: 192,
          borderRadius: 96,
          backgroundColor: 'white',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {children}
      </View>
    </View>
  )
}

function CounterDown({ time, onFinish }: { time: number, onFinish: () => void }) {
  const [timeLeft, setTimeLeft] = useState({ start: Date.now(), left: time * 1000 });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const left = Math.max((time * 1000) - (now - timeLeft.start), 0);
      if (left === 0) return onFinish();
      setTimeLeft({ start: timeLeft.start, left });
    }, 10);

    return () => {
      clearInterval(interval);
    }
  });

  const secondsLeft = timeLeft.left / 1000;
  const msLeft = timeLeft.left % 1000;
  return (
    <Clock current={secondsLeft} max={time}>
      <Text>
        00:
        {String(Math.floor(secondsLeft)).padStart(2, '0')}
        .
        {String(msLeft).padStart(3, '0')}
      </Text>
    </Clock>
  );
}

export default function Index() {
  const [counter, setCounter] = useState(0);
  const [timer, setTimer] = useState<Timer>();
  const [gettingReady, setGettingReady] = useState(false);

  const begin = (startValue = 0) => {
    setTimer({
      prev: Date.now(),
      crr: startValue,
      key: setInterval(() => {
        setTimer(crr => {
          if (!crr) return;

          const time = Date.now();
          return {
            prev: time,
            crr: crr.crr + (time - crr.prev),
            key: crr.key,
          };
        })
      }, 10)
    })
  }

  const pause = () => {
    setTimer(crr => {
      if (!crr) return;
      clearInterval(crr.key!);
      return { ...crr, key: null };
    })
  }

  if (gettingReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CounterDown
          time={5}
          onFinish={() => {
            setGettingReady(false);
            begin(0);
          }}
        />
      </View>
    );
  }

  if (!timer) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Clock current={10} max={60}>
          <Button
            title="Começar"
            onPress={() => setGettingReady(true)}
          />
        </Clock>
      </View>
    );
  }

  const minutes = timer.crr / 1000 / 60;
  const seconds = (timer.crr / 1000) % 60;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        gap: 20,
      }}
    >
      <Clock current={seconds} max={60}>
        <Text>
          {String(Math.floor(minutes)).padStart(2, '0')}
          :
          {String(Math.floor(seconds)).padStart(2, '0')}
        </Text>
      </Clock>

      {
        timer.key ? (
          <Button
            title="Pausar"
            onPress={pause}
          />
        ) : (
          <Button
            title="Continuar"
            onPress={() => begin(timer.crr)}
          />
        )
      }

      <Button
        title={String(counter)}
        onPress={() => setCounter(prev => prev + 1)}
      />

      <Button
        title="Reset"
        onPress={() => setTimer(undefined)}
      />
    </View>
  );
}
