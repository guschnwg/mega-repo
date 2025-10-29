import React from "react";
import { Text, View } from "react-native";

import { styles } from '../../styles';
import { PlusMinus } from "../PlusMinus";

export const ConfigureAMRAP = ({ step, onUpdate }: { step: AMRAPStepType, onUpdate: (step: AMRAPStepType) => void }) => {
  const minutes = Math.floor(step.config.time / 60);
  const seconds = Math.floor(step.config.time % 60).toString().padStart(2, '0');

  return (
    <PlusMinus
      onMinus={() => {
        step.config.time -= 15;
        onUpdate(step);
      }}
      onPlus={() => {
        step.config.time += 15;
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
    </PlusMinus>
  );
}
