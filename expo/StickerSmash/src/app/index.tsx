import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ScreenOrientation from "expo-screen-orientation"

import { Clock } from "../components/Clock";
import { Countdown } from "../components/Countdown";
import { styles } from '../styles';
import { OurButton } from "../components/OurButton";
import { Slidable } from "../components/Slidable";

const LayoutAware = ({ height, children }: { height: number, children: ({ ready, height, width }: { ready: boolean, height: number, width: number }) => React.ReactNode }) => {
  const dimensions = useWindowDimensions();
  const ref = useRef<View>(null);
  const [layout, setDimensions] = useState({
    ready: false,
    width: 0,
    height: 0,
  });

  useLayoutEffect(() => {
    // Give some time because sometimes it bugs
    setTimeout(() => {
      ref.current?.measureInWindow((x, y, width, height) => {
        setDimensions({ ready: true, width, height });
      });
    }, 100);
  }, [dimensions]);

  return (
    <View
      ref={ref}
      style={{
        height,
        alignSelf: 'stretch'
      }}
    >
      {children(layout)}
    </View>
  )
}

const Chart = ({ height, width, counter, currentTime, endTime }: { counter: CounterType, currentTime: number, endTime: number, height: number, width: number }) => {
  const maxHeight = (counter.value < 30 ? 40 : counter.value + Math.round(counter.value / 5));
  const stepSize = counter.value > 80 ? 20 : counter.value > 40 ? 10 : 8;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'space-between',
        flexDirection: 'row',
        borderBlockColor: 'green',
        borderTopWidth: 2,
        borderBottomWidth: 2,
      }}
    >
      {[...Array(10).keys()].map((k, i) => (
        <View
          key={k}
          style={{
            width: i === 0 || i === 9 ? 2 : 1,
            backgroundColor: 'green',
          }}
        />
      ))}

      {[...Array(Math.ceil(maxHeight / stepSize)).keys()].map(i => (
        <View
          key={i}
          style={{
            position: 'absolute',
            bottom: height * i * stepSize / maxHeight - 1,
            left: 0,
            height: 1,
            opacity: .3,
            width,
            backgroundColor: 'gray',
          }}
        >
          <Text
            style={{
              color: 'dark',
              position: 'absolute',
              top: (height * i * stepSize / maxHeight - 1) > height - 10 ? -2 : -9,
              left: 2,
              fontSize: 8,
            }}
          >
            {i * stepSize}
          </Text>
        </View>
      ))}

      {counter.history.map((h, i) => (
        <View
          key={`${h}-${i}`}
          style={{
            position: 'absolute',
            height: 2,
            width: 2,
            borderRadius: 1,
            bottom: height * i / maxHeight + 1,
            left: width * h / (endTime * 1000) - 1,
            backgroundColor: 'purple'
          }}
        />
      ))}

      <View
        style={{
          position: 'absolute',
          height: height - 4,
          left: width * currentTime / (endTime * 1000),
          width: 1,
          backgroundColor: 'blue',
        }}
      />
    </View>
  )
}

const Timer = ({ startTime, endTime, clockMax, onEnd, onStop }: React.PropsWithChildren<{ startTime?: number, endTime: number, clockMax?: number, onEnd: (counter: CounterType) => void, onStop: () => void }>) => {
  const begin = (crr: number, counter?: CounterType): TimerType => {
    return {
      counter: counter || {
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
  const dimensions = useWindowDimensions();

  const pause = () => {
    setTimer(crr => {
      clearInterval(crr.key!);
      return { ...crr, key: null };
    })
  }

  const resume = () => {
    setTimer(prev => begin(prev.crr, prev.counter));
  }

  const minutes = timer.crr / 1000 / 60;
  const seconds = (timer.crr / 1000) % 60;

  const timeLeft = endTime - timer.crr / 1000;
  return (
    <View
      style={{
        flex: 1,
        gap: 20,
        backgroundColor: timeLeft < 5 ? `rgba(255, 0, 0, ${timeLeft % 1})` : 'transparent',
        flexDirection: dimensions.height > dimensions.width ? 'column' : 'row',
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          flexDirection: dimensions.height > dimensions.width ? 'row' : 'column',
          gap: 20,
        }}
      >
        <Clock current={seconds} max={clockMax || endTime}>
          <Text style={{ fontSize: 48, color: styles.textDark }}>
            {String(Math.floor(minutes)).padStart(2, '0')}
            :
            {String(Math.floor(seconds)).padStart(2, '0')}
          </Text>
        </Clock>

        <View
          style={{
            gap: 20,
            flexDirection: dimensions.height > dimensions.width ? 'column' : 'row',
          }}
        >
          <OurButton
            title={timer.key ? "Pausar" : "Continuar"}
            onPress={timer.key ? pause : resume}
          />

          <OurButton
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
          if (!timer.key) return;

          setTimer(crr => ({
            ...crr,
            counter: {
              value: crr.counter.value + 1,
              history: [...crr.counter.history, crr.crr],
            }
          }))
        }}
      >
        <Text
          style={{
            fontSize: 128,
            marginBlock: 'auto',
            color: styles.textDark,
          }}
        >
          {timer.counter.value}
        </Text>

        <LayoutAware height={100}>
          {({ ready, width, height }) => (
            ready && (
              <Chart
                height={height}
                width={width}
                counter={timer.counter}
                currentTime={timer.crr}
                endTime={endTime}
              />
            )
          )}
        </LayoutAware>
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

const Wod = ({ startTime, endTime, countdownSeconds, onEnd, onStop }: React.PropsWithChildren<{ startTime?: number, endTime: number, countdownSeconds?: number, onEnd: (counter: CounterType) => void, onStop: () => void }>) => {
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
        backgroundColor: styles.background,
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
        onStop={onStop}
      />
    </View>
  );
}

const ConfigureAMRAP = ({ step, onUpdate }: { step: StepType, onUpdate: (step: StepType) => void }) => {
  const minutes = Math.floor(step.endTime / 60);
  const seconds = Math.floor(step.endTime % 60).toString().padStart(2, '0');

  return (
    <>
      <OurButton
        title="-"
        style={{ width: 60, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderWidth: 0 }}
        onPress={() => {
          step.endTime -= 15;
          onUpdate(step);
        }}
      />
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: styles.fontSize,
            color: styles.textDark,
          }}
        >
          As many reps as possible in
        </Text>
        <Text
          style={{
            fontSize: styles.fontSize + 4
          }}
        >
          {minutes === 0 ? `${seconds} seconds` : `${minutes}:${seconds} minutes`}
        </Text>
      </View>
      <OurButton
        title="+"
        style={{ width: 60, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderWidth: 0 }}
        onPress={() => {
          step.endTime += 15;
          onUpdate(step);
        }}
      />
    </>
  );
}

const ConfigureStep = ({ step, canRemove, onUpdate, onRemove }: { step: StepType, canRemove: boolean, onUpdate: (step: StepType) => void, onRemove: () => void }) => {
  return (
    <Slidable
      style={{
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'center',
        borderRadius: styles.radius,
        borderWidth: 1,
        borderColor: styles.secondary,
        height: 80,
      }}
      canSlide={canRemove}
      onSlide={onRemove}
    >
      {step.type === 'AMRAP' && <ConfigureAMRAP step={step} onUpdate={onUpdate} />}
    </Slidable>
  );
}

const ConfigureSteps = ({ steps, onUpdate }: { steps: StepType[], onUpdate: (steps: StepType[]) => void }) => {
  const [key, setKey] = useState(0);

  return (
    <View
      key={key}
      style={{
        gap: 10,
      }}
    >
      {steps.map((step, i) => (
        <ConfigureStep
          key={i}
          step={step}
          canRemove={steps.length > 1}
          onUpdate={step => {
            steps[i] = step;
            onUpdate([...steps]);
            setKey(crr => crr + 1);
          }}
          onRemove={() => {
            onUpdate([...steps.slice(0, i), ...steps.slice(i + 1)]);
            setKey(crr => crr + 1);
          }}
        />
      ))}

      <View
        style={{
          flexDirection: 'row',
        }}
      >
        <OurButton
          title="+ AMRAP"
          style={{ flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          onPress={() => {
            onUpdate(JSON.parse(JSON.stringify([...steps, steps[steps.length - 1]])));
            setKey(crr => crr + 1);
          }}
        />
        <OurButton
          title="+ AMRAP"
          style={{ flex: 1, borderRadius: 0 }}
          onPress={() => {
            onUpdate(JSON.parse(JSON.stringify([...steps, steps[steps.length - 1]])));
            setKey(crr => crr + 1);
          }}
        />
        <OurButton
          title="+ AMRAP"
          style={{ flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
          onPress={() => {
            onUpdate(JSON.parse(JSON.stringify([...steps, steps[steps.length - 1]])));
            setKey(crr => crr + 1);
          }}
        />
      </View>
    </View>
  );
}

const EndGame = ({ steps, onReset }: { steps: StepType[], onReset: () => void }) => (
  <ScrollView
    style={{
      flex: 1,
    }}
    contentContainerStyle={{
      flexDirection: 'column',
      gap: 10,
      paddingInline: 50,
      paddingBlock: 20,
    }}
  >
    <OurButton
      title="Reset"
      onPress={onReset}
    />

    {steps.map((s, i) => (
      <>
        <Text>{s.counter.value} reps in {s.endTime} seconds</Text>
        <LayoutAware key={i} height={100}>
          {({ ready, ...rest }) => ready && (
            <Chart
              {...rest}
              counter={s.counter}
              currentTime={s.endTime}
              endTime={s.endTime}
            />
          )}
        </LayoutAware>
      </>
    ))}
  </ScrollView>
);

export default function Index() {
  const [index, setIndex] = useState(-1);
  const [steps, setSteps] = useState<StepType[]>([
    { type: 'AMRAP', countdownSeconds: 3, endTime: 30, counter: { value: 0, history: [] } },
    { type: 'AMRAP', endTime: 30, counter: { value: 0, history: [] } },
    { type: 'AMRAP', endTime: 30, counter: { value: 0, history: [] } },
  ]);

  useEffect(() => {
    const unlockScreenOerientation = async () => {
      await ScreenOrientation.unlockAsync()
    }
    unlockScreenOerientation()
  }, []);

  let content = null;
  if (index === -1) {
    content = (
      <>
        <View style={{
          height: 200,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text
            style={{
              fontSize: 48,
              color: styles.textLight,
            }}
          >
            WOD
          </Text>
        </View>

        <View
          style={{
            flex: 1,
            padding: 10,
            gap: 10,
            backgroundColor: styles.background,
          }}
        >
          <ConfigureSteps
            steps={steps}
            onUpdate={setSteps}
          />

          <OurButton
            style={{
              marginTop: 'auto',
              height: 100,
            }}
            onPress={() => setIndex(crr => crr + 1)}
          >
            <Text
              style={{
                fontSize: 36,
              }}
            >
              START!
            </Text>
          </OurButton>
        </View>
      </>
    );
  } else if (index >= steps.length) {
    content = <EndGame steps={steps} onReset={() => setIndex(-1)} />
  } else {
    content = (
      <Wod
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
        onStop={() => setIndex(-1)}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: styles.primary }}>
      {content}
    </SafeAreaView>
  );
}
