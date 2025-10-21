import React from "react";
import { Text, View } from "react-native";

import { styles } from '../../styles';
import { PlusMinus } from "../PlusMinus";

export const ConfigureRest = ({ step, onUpdate }: { step: StepType, onUpdate: (step: StepType) => void }) => {
  const minutes = Math.floor(step.endTime / 60);
  const seconds = Math.floor(step.endTime % 60).toString().padStart(2, '0');

  return (
    <PlusMinus
      onMinus={() => {
        step.endTime -= 15;
        onUpdate(step);
      }}
      onPlus={() => {
        step.endTime += 15;
        onUpdate(step);
      }}
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
            fontSize: styles.fontSize,
            color: styles.textDark,
          }}
        >
          Rest for
        </Text>
        <Text
          style={{
            fontSize: styles.fontSize + 4
          }}
        >
          {minutes === 0 ? `${seconds} seconds` : `${minutes}:${seconds} minutes`}
        </Text>
      </View>
    </PlusMinus>
  );
}
