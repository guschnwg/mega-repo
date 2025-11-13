import React, { useState, useEffect, useRef } from "react";
import {
  Text,
  View,
  BackHandler,
  Alert,
  ScrollView,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ScreenOrientation from "expo-screen-orientation";

import { styles } from "../styles";
import { OurButton } from "../components/OurButton";
import { ConfigureAMRAP } from "../components/configure/AMRAP";
import { ConfigureEMOM } from "../components/configure/EMOM";
import { ConfigureSet } from "../components/configure/Set";
import { ConfigureRest } from "../components/configure/Rest";
import { Countdown } from "../components/Countdown";
import { RunWod } from "../components/RunWod";
import { EndWod } from "../components/EndWod";
import { TextPicker } from "../components/TextPicker";
import { List } from "../components/List";
import { iota } from "../utils";

enum StepTypesEnum {
  AMRAP = "AMRAP",
  Rest = "Rest",
  Wait = "Wait",
  EMOM = "EMOM",
  Set = "Set",
};

const MultiButton = ({
  title,
  options,
  style,
  onOpen,
  onPress,
}: {
  title: string;
  options: string[];
  style: ViewStyle;
  onOpen?: () => void;
  onPress: (option: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  // Figure out a overlay instead of the cancel button
  if (open) {
    return (
      <View
        style={{
          zIndex: 1,
          width: "100%",
        }}
      >
        {options.map((option, i) => (
          <OurButton
            title={option}
            style={{
              ...(i === 0
                ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
                : { borderRadius: 0 }),
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
            borderTopRightRadius: 0,
          }}
          onPress={() => setOpen(false)}
        />
      </View>
    );
  }

  return (
    <OurButton
      title={title}
      style={style}
      onPress={() => {
        onOpen?.();
        setOpen(true);
      }}
    />
  );
};

const ConfigureStep = ({ index, step, onUpdate }: { index: number, step: StepType, onUpdate: (step: StepTypes) => void }) => (
  <>
    <Text
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: styles.primaryDark,
        color: styles.textLight,
        width: 20,
        textAlign: 'center',
        borderTopLeftRadius: styles.radius - 1,
        borderBottomRightRadius: styles.radius,
      }}
    >
      {index}
    </Text>
    {step.type === StepTypesEnum.AMRAP && (
      <ConfigureAMRAP step={step} onUpdate={onUpdate} />
    )}
    {step.type === StepTypesEnum.EMOM && (
      <ConfigureEMOM step={step} onUpdate={onUpdate} />
    )}
    {step.type === StepTypesEnum.Set && (
      <ConfigureSet step={step} onUpdate={onUpdate} />
    )}
    {step.type === StepTypesEnum.Rest && (
      <ConfigureRest step={step} onUpdate={onUpdate} />
    )}
    {step.type === StepTypesEnum.Wait && (
      <Text
        style={{
          fontSize: 18,
          textAlign: "center",
          textAlignVertical: "center",
        }}
      >
        Wait for input
      </Text>
    )}
  </>
);

const ConfigureCountdown = ({ countdown, onUpdate }: { countdown: number, onUpdate: (value: number) => void }) => (
  <View
    style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
      gap: 5,
    }}
  >
    <Text
      style={{
        fontSize: styles.fontSize,
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
);

const ConfigureAdd = ({ onOpenButton, onNewStep }: { onOpenButton: () => void, onNewStep: (step: StepType) => void }) => (
  <MultiButton
    title="+ Add"
    options={[
      StepTypesEnum.AMRAP,
      StepTypesEnum.EMOM,
      StepTypesEnum.Rest,
      StepTypesEnum.Set,
      StepTypesEnum.Wait,
    ]}
    style={{ flex: 1 }}
    onOpen={onOpenButton}
    onPress={(option) => {
      let newStep: StepTypes | undefined = undefined;
      if (option === StepTypesEnum.AMRAP) {
        newStep = {
          type: StepTypesEnum.AMRAP,
          config: { time: 30, counter: { value: 0, history: [] } },
        };
      } else if (option === StepTypesEnum.EMOM) {
        newStep = {
          type: StepTypesEnum.EMOM,
          config: {
            counters: [
              { time: 30, max: 10, value: 0, history: [] },
              { time: 30, max: 10, value: 0, history: [] },
              { time: 30, max: 10, value: 0, history: [] },
              { time: 30, max: 10, value: 0, history: [] },
            ],
          },
        };
      } else if (option === StepTypesEnum.Rest) {
        newStep = { type: StepTypesEnum.Rest, config: { time: 10 } };
      } else if (option === StepTypesEnum.Set) {
        newStep = {
          type: StepTypesEnum.Set,
          config: {
            counters: [{ max: 10, value: 0, history: [] }],
            waits: [],
          },
        };
      } else if (option === StepTypesEnum.Wait) {
        newStep = { type: StepTypesEnum.Wait, config: { time: 10 } };
      }
      if (newStep) {
        onNewStep({ id: iota(), ...newStep });
      }
    }}
  />
);

const ConfigureSteps = ({
  countdown,
  onUpdateCountdown,
  steps,
  onUpdate,
}: {
  countdown: number;
  steps: StepType[];
  onUpdateCountdown: React.Dispatch<React.SetStateAction<number>>;
  onUpdate: (steps: StepType[] | ((prev: StepType[]) => StepType[])) => void;
}) => {
  const [key, setKey] = useState(0);
  const [onAdd, setOnAdd] = useState(false)
  const ref = useRef<ScrollView>(null);

  useEffect(() => {
    ref.current?.scrollToEnd({ animated: true });
  }, [onAdd]);

  return (
    <List
      key={key}
      ref={ref}
      items={[
        {
          id: 0,
          component: <ConfigureCountdown key={0} countdown={countdown} onUpdate={onUpdateCountdown} />
        },
        ...steps.map((step, i) => ({
          id: step.id,
          component: <ConfigureStep
            key={step.id}
            index={i + 1}
            step={step}
            onUpdate={(step) => {
              steps[i] = { id: steps[i].id, ...step };
              onUpdate([...steps]);
              setKey((crr) => crr + 1);
            }}
          />
        })),
        {
          id: -1,
          component: (
            <ConfigureAdd
              key={-1}
              onOpenButton={() => ref.current?.scrollToEnd({ animated: true })}
              onNewStep={newStep => {
                onUpdate((prev) => [...prev, newStep]);
                setOnAdd(prev => !prev);
              }}
            />
          )
        }
      ]}
      canRemove={index => steps.length > 1 && index !== 0 && index !== steps.length + 1}
      onRemove={index => {
        const actualIndex = index - 1;
        onUpdate(prev => [...prev.slice(0, actualIndex), ...prev.slice(actualIndex + 1)]);
      }}
    />
  );
};

export default function Index() {
  const [index, setIndex] = useState(-2);
  const [countdown, setCountdown] = useState(3);
  const [steps, setSteps] = useState<StepType[]>([
    {
      id: iota(),
      type: StepTypesEnum.EMOM,
      config: {
        counters: [
          { time: 30, max: 10, value: 0, history: [] },
          { time: 30, max: 10, value: 0, history: [] },
          { time: 30, max: 10, value: 0, history: [] },
          { time: 30, max: 10, value: 0, history: [] },
        ],
      },
    },
  ]);

  useEffect(() => {
    const unlockScreenOerientation = async () => {
      await ScreenOrientation.unlockAsync();
    };
    unlockScreenOerientation();
  }, []);
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (index >= 0) {
          Alert.alert("Hold on!", "Are you sure you want to go back?", [
            { text: "Cancel", onPress: () => null, style: "cancel" },
            { text: "YES", onPress: () => setIndex(-2) },
          ]);
        } else {
          setIndex(-2);
        }
        return true;
      },
    );
    return () => backHandler.remove();
  }, [index]);

  let content = null;
  if (index === -2) {
    content = (
      <>
        <View
          style={{
            height: 100,
            justifyContent: "center",
            alignItems: "center",
            flexDirection: 'row',
            gap: 10,
          }}
        >
          <Text
            style={{
              fontSize: 36,
              color: styles.textLight,
            }}
          >
            New WOD
          </Text>

          <OurButton
            onPress={() => setIndex((crr) => crr + 1)}
          >
            <Text
              style={{
                fontSize: 36,
                lineHeight: 36,
                textAlignVertical: 'center',
              }}
            >
              ‣
            </Text>
          </OurButton>
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
          onFinish={() => setIndex((prev) => prev + 1)}
        />
      </View>
    );
  } else if (index >= steps.length) {
    content = <EndWod steps={steps} onReset={() => setIndex(-2)} />;
  } else {
    content = (
      <RunWod
        key={index}
        step={steps[index]}
        onEnd={(step) => {
          setSteps((crrSteps) => {
            crrSteps[index] = step;
            return crrSteps;
          });
          setIndex((crr) => crr + 1);
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
