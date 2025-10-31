import React from "react";
import { Text, View } from "react-native";

import { TextPicker } from "../TextPicker";

export const ConfigureEMOM = ({ step, onUpdate }: { step: EMOMStepType, onUpdate: (step: EMOMStepType) => void }) => {
  const minutes = Math.floor(step.config.time / 60);
  const seconds = Math.floor(step.config.time % 60).toString().padStart(2, '0');

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
      <TextPicker
        value={step.config.counter.max || 0}
        possible={[5, 10, 15, 20, 25, 30]}
        onUpdate={value => {
          step.config.counter.max = value;
          onUpdate(step);
        }}
      />
      <Text>reps in</Text>
      <TextPicker
        value={step.config.time || 0}
        possible={[5, 10, 15, 20, 25, 30]}
        text={minutes === 0 ? `${seconds}s` : `${minutes}:${seconds}`}
        onUpdate={value => {
          step.config.time = value;
          onUpdate(step);
        }}
      />
      <Text>for</Text>
      <TextPicker
        value={step.config.times}
        possible={[1, 2, 3, 4, 5, 6]}
        onUpdate={value => {
          step.config.times = value;
          onUpdate(step);
        }}
      />
      <Text>times</Text>
    </View>
  );
}
