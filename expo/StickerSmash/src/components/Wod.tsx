import React from "react";
import { View } from "react-native";

import { Amrap } from "./wod/AMRAP";
import { styles } from '../styles';
import { Rest } from "./wod/Rest";
import { Wait } from "./wod/Wait";

export const Wod = ({ step, onEnd, onStop }: { step: StepType, onEnd: (step: StepType) => void, onStop: () => void }) => {
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
          onEnd={counter => onEnd({
            ...step,
            config: {
              ...step.config,
              counter: counter,
            }
          })}
          onStop={onStop}
        />
      )}
      {step.type === 'Rest' && (
        <Rest
          step={step}
          onSkip={value => onEnd({
            ...step,
            config: {
              ...step.config,
              actual: value,
            }
          })}
          onEnd={() => onEnd({
            ...step,
            config: {
              ...step.config,
              actual: step.config.time,
            }
          })}
        />
      )}
      {step.type === 'Wait' && (
        <Wait
          onEnd={value => onEnd({
            ...step,
            config: {
              ...step.config,
              actual: value,
            }
          })}
        />
      )}
    </View>
  );
}
