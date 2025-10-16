import React, { useState } from "react";
import { Button, Text, View } from "react-native";
import { Clock } from "../components/Clock";
import { Countdown } from "../components/Countdown";
import { SafeAreaProvider } from "react-native-safe-area-context";

interface TimerType {
  prev: number
  crr: number
  key: number | null
}

const Timer = ({ startTime, endTime, clockMax, onEnd, onStop }: React.PropsWithChildren<{ startTime?: number, endTime: number, clockMax?: number, onEnd: () => void, onStop: () => void }>) => {
  const begin = (crr: number): TimerType => {
    return {
      prev: Date.now(),
      crr,
      key: setInterval(() => {
        setTimer(crr => {
          const time = Date.now();
          const next = crr.crr + (time - crr.prev);
          let key = crr.key;
          if (next >= endTime * 1000) {
            clearInterval(crr.key!);
            setTimeout(onEnd, 100);
            key = null;
          }
          onProgress(next);
          return { prev: time, crr: next, key: key };
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
  );
}

const TimerWithCountdown = ({ startTime, endTime, countdownSeconds, onStart, onEnd, onStop, children }: React.PropsWithChildren<{ startTime?: number, endTime: number, countdownSeconds?: number, onStart: () => void, onEnd: () => void, onStop: () => void }>) => {
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
    <>
      <Timer
        startTime={startTime}
        endTime={endTime}
        onEnd={() => onEnd()}
        onStop={() => onStop()}
      />

      {children}
    </>
  )
}

const TimerAndCounter = ({ startTime, endTime, countdownSeconds, onEnd }: React.PropsWithChildren<{ startTime?: number, endTime: number, countdownSeconds?: number, onEnd: (counter: number) => void }>) => {
  const [counter, setCounter] = useState(0);
  const [ended, setEnded] = useState(false);

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
          {counter}
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
        onEnd={() => setEnded(true)}
        onStop={() => { }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onTouchEnd={() => setCounter(prev => prev + 1)}
        >
          <Text style={{ fontSize: 128 }}>{counter}</Text>
        </View>
      </TimerWithCountdown>
    </View>
  );
}

export default function Index() {
  const [index, setIndex] = useState(-1);
  const [steps, setSteps] = useState([
    { endTime: 5, countdownSeconds: 3, counter: 0 },
    { endTime: 4, counter: 0 },
    { endTime: 3, counter: 0 },
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
          <TimerAndCounter
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
