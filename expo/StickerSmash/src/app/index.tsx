import React, { useState } from "react";
import { Button, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { Clock } from "../components/Clock";
import { Countdown } from "../components/Countdown";

interface CounterType {
  value: number
  history: number[]
}
interface TimerType {
  counter: CounterType
  prev: number
  crr: number
  key: number | null
}

const Timer = ({ startTime, endTime, clockMax, onEnd, onStop }: React.PropsWithChildren<{ startTime?: number, endTime: number, clockMax?: number, onEnd: (counter: CounterType) => void, onStop: () => void }>) => {
  const begin = (crr: number): TimerType => {
    return {
      counter: {
        value: 0,
        history: [],
      },
      prev: Date.now(),
      crr,
      key: setInterval(() => {
        setTimer(crr => {
          const time = Date.now();
          const next = crr.crr + (time - crr.prev);
          let key = crr.key;
          if (next >= endTime * 1000) {
            clearInterval(crr.key!);
            setTimeout(() => onEnd(crr.counter), 100);
            key = null;
          }
          return { counter: crr.counter, prev: time, crr: next, key: key };
        })
      }, 10),
    }
  }

  const [timer, setTimer] = useState<TimerType>(() => begin((startTime || 0) * 1000));

  const pause = () => {
    setTimer(crr => {
      clearInterval(crr.key!);
      return { ...crr, key: null };
    })
  }

  const resume = () => {
    setTimer(prev => begin(prev.crr));
  }

  const minutes = timer.crr / 1000 / 60;
  const seconds = (timer.crr / 1000) % 60;

  return (
    <View
      style={{
        flex: 1,
        gap: 20,
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: 'row',
          gap: 20,
        }}
      >
        <Clock current={seconds} max={clockMax || endTime}>
          <Text style={{ fontSize: 48 }}>
            {String(Math.floor(minutes)).padStart(2, '0')}
            :
            {String(Math.floor(seconds)).padStart(2, '0')}
          </Text>
        </Clock>

        <View
          style={{ gap: 20 }}
        >
          <Button
            title={timer.key ? "Pausar" : "Continuar"}
            onPress={timer.key ? pause : resume}
          />

          <Button
            title="Stop"
            onPress={onStop}
          />
        </View>
      </View>

      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onTouchEnd={() => {
          setTimer(crr => ({
            ...crr,
            counter: {
              value: crr.counter.value + 1,
              history: [...crr.counter.history, crr.crr],
            }
          }))
        }}
      >
        <Text style={{ fontSize: 128 }}>{timer.counter.value}</Text>
      </View>
    </View>
  );
}

const TimerWithCountdown = ({ startTime, endTime, countdownSeconds, onStart, onEnd, onStop, children }: React.PropsWithChildren<{ startTime?: number, endTime: number, countdownSeconds?: number, onStart: () => void, onEnd: (counter: CounterType) => void, onStop: () => void }>) => {
  const [gettingReady, setGettingReady] = useState(true);

  if (countdownSeconds && gettingReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Countdown
          time={countdownSeconds}
          onFinish={() => {
            setGettingReady(false);
            onStart();
          }}
        />
      </View>
    );
  }

  return (
    <Timer
      startTime={startTime}
      endTime={endTime}
      onEnd={onEnd}
      onStop={onStop}
    />
  )
}

const TimerScreen = ({ startTime, endTime, countdownSeconds, onEnd }: React.PropsWithChildren<{ startTime?: number, endTime: number, countdownSeconds?: number, onEnd: (counter: CounterType) => void }>) => {
  const [ended, setEnded] = useState(false);
  const [counter, setCounter] = useState<CounterType>({ value: 0, history: [] });

  if (ended) {
    setTimeout(() => onEnd(counter));
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'green',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onTouchEnd={() => onEnd(counter)}
      >
        <Text
          style={{
            color: 'white',
            fontSize: 128,
          }}
        >
          {counter.value}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <TimerWithCountdown
        startTime={startTime}
        endTime={endTime}
        countdownSeconds={countdownSeconds}
        onStart={() => { }}
        onEnd={counter => {
          setEnded(true)
          setCounter(counter);
        }}
        onStop={() => { }}
      />
    </View>
  );
}

export default function Index() {
  const [index, setIndex] = useState(-1);
  const [steps, setSteps] = useState([
    { endTime: 5, countdownSeconds: 3, counter: { value: 0, history: [] as number[] } },
    { endTime: 4, counter: { value: 0, history: [] as number[] } },
    { endTime: 3, counter: { value: 0, history: [] as number[] } },
  ]);

  return (
    <SafeAreaProvider>
      {index === -1 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: 'red',
          }}
        >
          <Button
            title="Start timer"
            onPress={() => setIndex(crr => crr + 1)}
          />
        </View>
      ) : (
        index >= steps.length ? (
          <Text style={{ padding: 50 }}>
            {JSON.stringify(steps, null, 2)}
          </Text>
        ) : (
          <TimerScreen
            key={index}
            endTime={steps[index].endTime}
            countdownSeconds={steps[index].countdownSeconds}
            onEnd={counter => {
              setSteps(crrSteps => {
                crrSteps[index].counter = counter;
                return crrSteps;
              })
              setIndex(crr => crr + 1)
            }}
          />
        )
      )}
    </SafeAreaProvider>
  );
}
