import React from "react";
import { Text, View } from "react-native";

import { styles } from '../../styles';
import { TextPicker } from "../TextPicker";

export const ConfigureRest = ({ step, onUpdate }: { step: RestStepType, onUpdate: (step: RestStepType) => void }) => {
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
      <Text
        style={{
          fontSize: styles.fontSize,
          color: styles.textDark,
        }}
      >
        Rest for
      </Text>
      <TextPicker
        value={step.config.time || 0}
        possible={[5, 10, 15, 20, 25, 30]}
        text={minutes === 0 ? `${seconds}s` : `${minutes}:${seconds}`}
        onUpdate={value => {
          step.config.time = value;
          onUpdate(step);
        }}
      />
    </View>
  );
}
