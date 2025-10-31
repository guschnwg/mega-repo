import React from "react";
import { View } from "react-native";

import { Amrap } from "./wod/AMRAP";
import { styles } from '../styles';
import { Rest } from "./wod/Rest";
import { Wait } from "./wod/Wait";

export const RunWod = ({ step, onEnd, onStop }: { step: StepType, onEnd: (step: StepType) => void, onStop: () => void }) => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: styles.background,
      }}
    >
      {step.type === 'AMRAP' && (
        <Amrap
          time={step.config.time}
          onEnd={counter => {
            step.config.counter = counter;
            onEnd(step);
          }}
          onStop={onStop}
        />
      )}
      {step.type === 'Rest' && (
        <Rest
          step={step}
          onSkip={value => {
            step.config.actual = value;
            onEnd(step);
          }}
          onEnd={() => {
            step.config.actual = step.config.time;
            onEnd(step)
          }}
        />
      )}
      {step.type === 'Wait' && (
        <Wait
          onEnd={value => {
            step.config.actual = value;
            onEnd(step);
          }}
        />
      )}
    </View>
  );
}
