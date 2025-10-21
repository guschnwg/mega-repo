import React from "react";
import { View } from "react-native";

import { Amrap } from "./wod/AMRAP";
import { styles } from '../styles';
import { Rest } from "./wod/Rest";
import { Wait } from "./wod/Wait";

export const Wod = ({ step, onEnd, onStop }: React.PropsWithChildren<{ step: StepType, onEnd: (counter: CounterType) => void, onStop: () => void }>) => (
  <View
    style={{
      flex: 1,
      backgroundColor: styles.background,
    }}
  >
    {step.type === 'AMRAP' && (
      <Amrap
        startTime={step.startTime}
        endTime={step.endTime}
        onEnd={onEnd}
        onStop={onStop}
      />
    )}
    {step.type === 'Rest' && (
      <Rest
        step={step}
        onSkip={value => onEnd({ value: value, history: [] })}
        onEnd={() => onEnd({ value: step.endTime, history: [] })}
      />
    )}
    {step.type === 'Wait' && (
      <Wait
        onEnd={value => onEnd({ value, history: [] })}
      />
    )}
  </View>
);
