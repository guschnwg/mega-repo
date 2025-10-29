import React, { useState, useEffect } from "react";
import { Text, View, BackHandler, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ScreenOrientation from "expo-screen-orientation"

import { styles } from '../styles';
import { OurButton } from "../components/OurButton";
import { Slidable } from "../components/Slidable";
import { ConfigureAMRAP } from "../components/configure/AMRAP";
import { ConfigureEMOM } from "../components/configure/EMOM";
import { ConfigureRest } from "../components/configure/Rest";
import { Countdown } from "../components/Countdown";
import { PlusMinus } from "../components/PlusMinus";
import { Wod } from "../components/Wod";
import { EndWod } from "../components/EndWod";

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
      {step.type === 'EMOM' && <ConfigureEMOM step={step} onUpdate={onUpdate} />}
      {step.type === 'Rest' && <ConfigureRest step={step} onUpdate={onUpdate} />}
      {step.type === 'Wait' && (
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

  return (
    <ScrollView
      key={key}
      contentContainerStyle={{
        backgroundColor: styles.background,
        gap: 10,
      }}
    >
      <ConfigureCountdown
        countdown={countdown}
        onUpdate={onUpdateCountdown}
      />
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
            onUpdate(prev => [
              ...prev,
              { type: 'AMRAP', config: { time: 30, counter: { value: 0, history: [] } } }
            ]);
            setKey(crr => crr + 1);
          }}
        />
        <OurButton
          title="+ EMOM"
          style={{ flex: 1, borderRadius: 0 }}
          onPress={() => {
            onUpdate(prev => [
              ...prev,
              { type: 'EMOM', config: { time: 30, times: 5, counter: { value: 0, max: 10, history: [] } } }
            ]);
            setKey(crr => crr + 1);
          }}
        />
        <OurButton
          title="+ Wait"
          style={{ flex: 1, borderRadius: 0 }}
          onPress={() => {
            onUpdate(prev => [
              ...prev,
              { type: 'Wait', config: { time: 10 } }
            ]);
            setKey(crr => crr + 1);
          }}
        />
        <OurButton
          title="+ Rest"
          style={{ flex: 1, borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
          onPress={() => {
            onUpdate(prev => [
              ...prev,
              { type: 'Rest', config: { time: 10 } }
            ]);
            setKey(crr => crr + 1);
          }}
        />
      </View>
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
        height: 80,
      }}
    >
      <PlusMinus
        onMinus={() => onUpdate(prev => prev - 1)}
        onPlus={() => onUpdate(prev => prev + 1)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: styles.fontSize + 4
            }}
          >
            Countdown of {countdown}s
          </Text>
        </View>
      </PlusMinus>
    </View>
  )
}

export default function Index() {
  const [index, setIndex] = useState(-2);
  const [countdown, setCountdown] = useState(3);
  const [steps, setSteps] = useState<StepType[]>([
    { type: 'AMRAP', config: { time: 30, counter: { value: 0, history: [] } } },
    { type: 'Rest', config: { time: 30 } },
    { type: 'AMRAP', config: { time: 30, counter: { value: 0, history: [] } } },
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
      <Wod
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
