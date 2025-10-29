import React, { useRef } from "react";
import { Pressable, Text, View } from "react-native";

import { Picker } from '@react-native-picker/picker';

import { styles } from '../../styles';

const PressableText = ({ text, onPress }: { text: string | number, onPress: () => void }) => (
  <Pressable
    style={{
      borderRadius: styles.radius,
      borderColor: styles.primary,
      borderWidth: 1,
      padding: 10,
    }}
    onPress={onPress}
  >
    <Text
      style={{
        textAlign: 'center',
        fontSize: 18,
      }}
    >
      {text}
    </Text>
  </Pressable>
);

export const ConfigureEMOM = ({ step, onUpdate }: { step: EMOMStepType, onUpdate: (step: EMOMStepType) => void }) => {
  const minutes = Math.floor(step.config.time / 60);
  const seconds = Math.floor(step.config.time % 60).toString().padStart(2, '0');
  const repsRef = useRef<Picker<number>>(null);
  const timeRef = useRef<Picker<number>>(null);
  const timesRef = useRef<Picker<number>>(null);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        gap: 5,
      }}
    >
      <Picker
        ref={repsRef}
        style={{ display: 'none' }}
        selectedValue={step.config.counter.max}
        onValueChange={value =>
          onUpdate({ ...step, config: { ...step.config, counter: { ...step.config.counter, max: value } } })
        }
      >
        <Picker.Item label="5" value="5" />
        <Picker.Item label="10" value="10" />
        <Picker.Item label="15" value="15" />
        <Picker.Item label="20" value="20" />
        <Picker.Item label="25" value="25" />
        <Picker.Item label="30" value="30" />
      </Picker>

      <Picker
        ref={timeRef}
        style={{ display: 'none' }}
        selectedValue={step.config.time}
        onValueChange={value =>
          onUpdate({ ...step, config: { ...step.config, time: value } })
        }
      >
        <Picker.Item label="5" value="5" />
        <Picker.Item label="10" value="10" />
        <Picker.Item label="15" value="15" />
        <Picker.Item label="20" value="20" />
        <Picker.Item label="25" value="25" />
        <Picker.Item label="30" value="30" />
      </Picker>

      <Picker
        ref={timesRef}
        style={{ display: 'none' }}
        selectedValue={step.config.times}
        onValueChange={value =>
          onUpdate({ ...step, config: { ...step.config, times: value } })
        }
      >
        <Picker.Item label="1" value="1" />
        <Picker.Item label="2" value="2" />
        <Picker.Item label="3" value="3" />
        <Picker.Item label="4" value="4" />
        <Picker.Item label="5" value="5" />
        <Picker.Item label="6" value="6" />
      </Picker>

      <PressableText
        text={step.config.counter.max || 0}
        onPress={() => repsRef.current?.focus()}
      />
      <Text>reps in</Text>
      <PressableText
        text={minutes === 0 ? `${seconds} seconds` : `${minutes}:${seconds} minutes`}
        onPress={() => timeRef.current?.focus()}
      />
      <Text>for</Text>
      <PressableText
        text={step.config.times}
        onPress={() => timesRef.current?.focus()}
      />
      <Text>times</Text>
    </View>
  );
}
