import React from "react";
import { Text, View } from "react-native";

import { TextPicker } from "../TextPicker";

export const ConfigureSet = ({ step, onUpdate }: { step: SetStepType, onUpdate: (step: SetStepType) => void }) => {
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
        value={step.config.times}
        possible={[1, 2, 3, 4, 5, 6]}
        onUpdate={value => {
          step.config.times = value;
          onUpdate(step);
        }}
      />
      <Text>sets of</Text>
      <TextPicker
        value={step.config.counter.max || 0}
        possible={[5, 10, 15, 20, 25, 30]}
        onUpdate={value => {
          step.config.counter.max = value;
          onUpdate(step);
        }}
      />
      <Text>reps</Text>
    </View>
  );
}
