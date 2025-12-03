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
import { Header } from "../components/Header";

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
      text={`${countdown / 1000}s`}
      possible={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]}
      onUpdate={(value) => onUpdate(value * 1000)}
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
          config: { time: 30000, counter: { value: 0, history: [] } },
        };
      } else if (option === StepTypesEnum.EMOM) {
        newStep = {
          type: StepTypesEnum.EMOM,
          config: {
            counters: [
              { time: 30000, max: 10, value: 0, history: [] },
              { time: 30000, max: 10, value: 0, history: [] },
              { time: 30000, max: 10, value: 0, history: [] },
              { time: 30000, max: 10, value: 0, history: [] },
            ],
          },
        };
      } else if (option === StepTypesEnum.Rest) {
        newStep = { type: StepTypesEnum.Rest, config: { time: 10000 } };
      } else if (option === StepTypesEnum.Set) {
        newStep = {
          type: StepTypesEnum.Set,
          config: {
            counters: [{ max: 10, value: 0, history: [] }],
            waits: [],
          },
        };
      } else if (option === StepTypesEnum.Wait) {
        newStep = { type: StepTypesEnum.Wait, config: { time: 10000 } };
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
  const [index, setIndex] = useState(5);
  const [countdown, setCountdown] = useState(3000);
  const [steps, setSteps] = useState<StepType[]>(
    [{ "id": 7841375933, "type": "AMRAP", "config": { "time": 5000, "counter": { "value": 27, "history": [444, 608, 759, 908, 1059, 1242, 1575, 1725, 1891, 2058, 2240, 2407, 2574, 2739, 2890, 3073, 3223, 3372, 3539, 3705, 3872, 4022, 4187, 4321, 4504, 4654, 4821] } } }, { "id": 7841375934, "type": "EMOM", "config": { "counters": [{ "time": 5000, "max": 5, "value": 5, "history": [746, 946, 1146, 1346, 1978] }, { "time": 5000, "max": 5, "value": 2, "history": [997, 1147] }, { "time": 5000, "max": 5, "value": 0, "history": [] }, { "time": 5000, "max": 5, "value": 0, "history": [] }] } }, { "id": 7841375936, "type": "Rest", "config": { "time": 10000, "actual": 4824 } }, { "id": 7841375937, "type": "Set", "config": { "counters": [{ "max": 5, "value": 5, "history": [1180, 1695, 2028, 2795, 3410] }, { "max": 5, "value": 5, "history": [] }, { "max": 5, "value": 5, "history": [6920, 7617, 7951, 8134, 8467] }], "waits": [3578, 1296, 1577] } }, { "id": 7841375938, "type": "Wait", "config": { "time": 10000, "actual": 5106 } }]
  );
  const [ongoingSteps, setOngoingSteps] = useState<StepType[]>(
    [{ "id": 7841375933, "type": "AMRAP", "config": { "time": 5000, "counter": { "value": 27, "history": [444, 608, 759, 908, 1059, 1242, 1575, 1725, 1891, 2058, 2240, 2407, 2574, 2739, 2890, 3073, 3223, 3372, 3539, 3705, 3872, 4022, 4187, 4321, 4504, 4654, 4821] } } }, { "id": 7841375934, "type": "EMOM", "config": { "counters": [{ "time": 5000, "max": 5, "value": 5, "history": [746, 946, 1146, 1346, 1978] }, { "time": 5000, "max": 5, "value": 2, "history": [997, 1147] }, { "time": 5000, "max": 5, "value": 0, "history": [] }, { "time": 5000, "max": 5, "value": 0, "history": [] }] } }, { "id": 7841375936, "type": "Rest", "config": { "time": 10000, "actual": 4824 } }, { "id": 7841375937, "type": "Set", "config": { "counters": [{ "max": 5, "value": 5, "history": [1180, 1695, 2028, 2795, 3410] }, { "max": 5, "value": 5, "history": [] }, { "max": 5, "value": 5, "history": [6920, 7617, 7951, 8134, 8467] }], "waits": [3578, 1296, 1577] } }, { "id": 7841375938, "type": "Wait", "config": { "time": 10000, "actual": 5106 } }]
  );

  const startWod = () => {
    setOngoingSteps(JSON.parse(JSON.stringify(steps)));
    setIndex(-1);
  }

  const resetWod = () => {
    setIndex(-2);
  }

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        if (index >= 0) {
          Alert.alert("Hold on!", "Are you sure you want to go back?", [
            { text: "Cancel", onPress: () => null, style: "cancel" },
            { text: "YES", onPress: () => resetWod() },
          ]);
        } else {
          resetWod();
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
        <Header>
          <Text
            style={{
              fontSize: 36,
              color: styles.textLight,
            }}
          >
            New WOD
          </Text>

          <OurButton
            onPress={startWod}
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
        </Header>

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
          backgroundColor: styles.background,
          gap: 10,
        }}
      >
        <Header>
          <Text
            style={{
              fontSize: 36,
              color: styles.textLight,
            }}
          >
            Are you ready?
          </Text>
        </Header>

        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Countdown
            time={countdown}
            onFinish={() => setIndex(0)}
          />
        </View>
      </View>
    );
  } else if (index >= steps.length) {
    content = <EndWod steps={ongoingSteps} onReset={resetWod} />;
  } else {
    content = (
      <RunWod
        key={index}
        step={ongoingSteps[index]}
        onEnd={(step) => {
          setOngoingSteps((crrSteps) => {
            crrSteps[index] = step;
            return crrSteps;
          });
          setIndex((crr) => crr + 1);
        }}
        onStop={resetWod}
      />
    );
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: styles.primary
      }}
    >
      {content}
    </SafeAreaView>
  );
}
