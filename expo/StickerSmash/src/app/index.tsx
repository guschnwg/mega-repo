import React, { useState, useEffect, useRef } from "react";
import { Text, View, BackHandler, Alert, ScrollView, StyleProp, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ScreenOrientation from "expo-screen-orientation"

import { styles } from '../styles';
import { OurButton } from "../components/OurButton";
import { Slidable } from "../components/Slidable";
import { ConfigureAMRAP } from "../components/configure/AMRAP";
import { ConfigureEMOM } from "../components/configure/EMOM";
import { ConfigureSet } from "../components/configure/Set";
import { ConfigureRest } from "../components/configure/Rest";
import { Countdown } from "../components/Countdown";
import { RunWod } from "../components/RunWod";
import { EndWod } from "../components/EndWod";
import { TextPicker } from "../components/TextPicker";

enum StepTypesEnum {
  AMRAP = 'AMRAP',
  Rest = 'Rest',
  Wait = 'Wait',
  EMOM = 'EMOM',
  Set = 'Set',
}

const MultiButton = ({ title, options, style, onOpen, onPress }: { title: string, options: string[], style: ViewStyle, onOpen?: () => void, onPress: (option: string) => void }) => {
  const [open, setOpen] = useState(false);

  // Figure out a overlay instead of the cancel button
  if (open) {
    return (
      <View
        style={{
          zIndex: 1,
          width: '100%',
        }}
      >
        {options.map((option, i) => (
          <OurButton
            title={option}
            style={{
              ...(i === 0 ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 } : { borderRadius: 0 }),
              // ...(i !== 0 && i !== options.length - 1 ? { borderRadius: 0 } : {}),
              // ...(i === options.length - 1 ? { borderTopLeftRadius: 0, borderTopRightRadius: 0 } : {}),
            }}
            key={option}
            onPress={() => {
              onPress(option);
              setOpen(false);
            }}
          />
        ))}
        <OurButton
          title="Cancel"
          style={{
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0
          }}
          onPress={() => setOpen(false)}
        />
      </View>
    )
  }

  return (
    <OurButton
      title={title}
      style={style}
      onPress={() => {
        onOpen?.();
        setOpen(true)
      }}
    />
  );
}

const ConfigureStep = ({ step, canRemove, onSlideStart, onSlideEnd, onUpdate, onRemove }: { step: StepType, canRemove: boolean, onSlideStart?: () => void, onSlideEnd?: () => void, onUpdate: (step: StepType) => void, onRemove: () => void }) => {
  return (
    <Slidable
      style={{
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'center',
        borderRadius: styles.radius,
        borderWidth: 1,
        borderColor: styles.secondary,
        height: 60,
      }}
      canSlide={canRemove}
      onSlideStart={onSlideStart}
      onSlideEnd={onSlideEnd}
      onSlide={onRemove}
    >
      {step.type === StepTypesEnum.AMRAP && <ConfigureAMRAP step={step} onUpdate={onUpdate} />}
      {step.type === StepTypesEnum.EMOM && <ConfigureEMOM step={step} onUpdate={onUpdate} />}
      {step.type === StepTypesEnum.Set && <ConfigureSet step={step} onUpdate={onUpdate} />}
      {step.type === StepTypesEnum.Rest && <ConfigureRest step={step} onUpdate={onUpdate} />}
      {step.type === StepTypesEnum.Wait && (
        <Text
          style={{
            fontSize: 18,
            textAlign: 'center',
            textAlignVertical: 'center'
          }}
        >Wait for input</Text>
      )}
    </Slidable>
  );
}

const ConfigureSteps = ({ countdown, onUpdateCountdown, steps, onUpdate }: { countdown: number, steps: StepType[], onUpdateCountdown: React.Dispatch<React.SetStateAction<number>>, onUpdate: (steps: StepType[] | ((prev: StepType[]) => StepType[])) => void }) => {
  const [key, setKey] = useState(0);
  const ref = useRef<ScrollView>(null);
  const [canScroll, setCanScroll] = useState(true);
  const [scrolling, setScrolling] = useState(false);

  useEffect(() => {
    ref.current?.scrollToEnd({ animated: true });
  }, [key]);

  return (
    <ScrollView
      key={key}
      ref={ref}
      contentContainerStyle={{
        backgroundColor: canScroll ? styles.background : 'red',
        gap: 10,
      }}
      scrollEnabled={canScroll}
      onScrollBeginDrag={() => setScrolling(true)}
      onScrollEndDrag={() => setScrolling(false)}
      onScrollAnimationEnd={() => setScrolling(false)}
    >
      <ConfigureCountdown
        countdown={countdown}
        onUpdate={onUpdateCountdown}
      />
      {steps.map((step, i) => (
        <ConfigureStep
          key={i}
          step={step}
          canRemove={!scrolling && steps.length > 1}
          onSlideStart={() => setCanScroll(false)}
          onSlideEnd={() => setCanScroll(true)}
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

      <MultiButton
        title="+ Add"
        options={[StepTypesEnum.AMRAP, StepTypesEnum.EMOM, StepTypesEnum.Rest, StepTypesEnum.Set, StepTypesEnum.Wait]}
        style={{ flex: 1 }}
        onOpen={() => {
          ref.current?.scrollToEnd({ animated: true });
        }}
        onPress={option => {
          let newStep: StepType | undefined = undefined;
          if (option === StepTypesEnum.AMRAP) {
            newStep = { type: StepTypesEnum.AMRAP, config: { time: 30, counter: { value: 0, history: [] } } };
          } else if (option === StepTypesEnum.EMOM) {
            newStep = { type: StepTypesEnum.EMOM, config: { time: 30, times: 5, counter: { value: 0, max: 10, history: [] } } };
          } else if (option === StepTypesEnum.Rest) {
            newStep = { type: StepTypesEnum.Rest, config: { time: 10 } };
          } else if (option === StepTypesEnum.Set) {
            newStep = { type: StepTypesEnum.Set, config: { times: 5, counter: { value: 0, max: 10, history: [] } } };
          } else if (option === StepTypesEnum.Wait) {
            newStep = { type: StepTypesEnum.Wait, config: { time: 10 } }
          }
          if (newStep) {
            onUpdate(prev => [...prev, newStep]);
            setKey(crr => crr + 1);
          }
        }}
      />
    </ScrollView>
  );
}

const ConfigureCountdown = ({ countdown, onUpdate }: { countdown: number, onUpdate: React.Dispatch<React.SetStateAction<number>> }) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'center',
        borderRadius: styles.radius,
        borderWidth: 1,
        borderColor: styles.secondary,
        height: 60,
      }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          gap: 5,
        }}
      >
        <Text
          style={{
            fontSize: styles.fontSize
          }}
        >
          Countdown of
        </Text>
        <TextPicker
          value={countdown}
          text={`${countdown}s`}
          possible={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
          onUpdate={onUpdate}
        />
      </View>
    </View>
  )
}

export default function Index() {
  const [index, setIndex] = useState(-2);
  const [countdown, setCountdown] = useState(3);
  const [steps, setSteps] = useState<StepType[]>([
    { type: StepTypesEnum.AMRAP, config: { time: 30, counter: { value: 0, history: [] } } },
    { type: StepTypesEnum.Rest, config: { time: 30 } },
    { type: StepTypesEnum.AMRAP, config: { time: 30, counter: { value: 0, history: [] } } },
    { type: StepTypesEnum.Rest, config: { time: 30 } },
    { type: StepTypesEnum.Rest, config: { time: 30 } },
    { type: StepTypesEnum.Rest, config: { time: 30 } },
    { type: StepTypesEnum.Rest, config: { time: 30 } },
    { type: StepTypesEnum.Rest, config: { time: 30 } },
    { type: StepTypesEnum.Rest, config: { time: 30 } },
  ]);

  useEffect(() => {
    const unlockScreenOerientation = async () => {
      await ScreenOrientation.unlockAsync()
    }
    unlockScreenOerientation()
  }, []);
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (index >= 0) {
        Alert.alert('Hold on!', 'Are you sure you want to go back?', [
          { text: 'Cancel', onPress: () => null, style: 'cancel' },
          { text: 'YES', onPress: () => setIndex(-2) },
        ]);
      } else {
        setIndex(-2);
      }
      return true;
    });
    return () => backHandler.remove();
  }, [index]);

  let content = null;
  if (index === -2) {
    content = (
      <>
        <View style={{
          height: 100,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Text
            style={{
              fontSize: 36,
              color: styles.textLight,
            }}
          >
            New WOD
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
            countdown={countdown}
            onUpdateCountdown={setCountdown}
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
  } else if (index === -1) {
    content = (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: styles.background,
        }}
      >
        <Countdown
          time={countdown}
          onFinish={() => setIndex(prev => prev + 1)}
        />
      </View>
    );
  } else if (index >= steps.length) {
    content = (
      <EndWod
        steps={steps}
        onReset={() => setIndex(-2)}
      />
    )
  } else {
    content = (
      <RunWod
        key={index}
        step={steps[index]}
        onEnd={step => {
          setSteps(crrSteps => {
            crrSteps[index] = step;
            return crrSteps;
          })
          setIndex(crr => crr + 1)
        }}
        onStop={() => setIndex(-2)}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: styles.primary }}>
      {content}
    </SafeAreaView>
  );
}
