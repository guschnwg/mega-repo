import React from "react";
import { View } from "react-native";

import { WodAmrap } from "./wod/AMRAP";
import { styles } from "../styles";
import { WodRest } from "./wod/Rest";
import { WodWait } from "./wod/Wait";
import { WodSet } from "./wod/Set";
import { WodEMOM } from "./wod/EMOM";

export const RunWod = ({
  step,
  onEnd,
  onStop,
}: {
  step: StepType;
  onEnd: (step: StepType) => void;
  onStop: () => void;
}) => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: styles.background,
      }}
    >
      {step.type === "AMRAP" && (
        <WodAmrap
          time={step.config.time}
          onEnd={(counter) => {
            step.config.counter = counter;
            onEnd(step);
          }}
          onStop={onStop}
        />
      )}
      {step.type === "Rest" && (
        <WodRest
          step={step}
          onSkip={(value) => {
            step.config.actual = value;
            onEnd(step);
          }}
          onEnd={() => {
            step.config.actual = step.config.time;
            onEnd(step);
          }}
        />
      )}
      {step.type === "Wait" && (
        <WodWait
          onEnd={(value) => {
            step.config.actual = value;
            onEnd(step);
          }}
        />
      )}
      {step.type === "Set" && (
        <WodSet
          step={step}
          onEnd={(config) => {
            step.config = config;
            onEnd(step);
          }}
        />
      )}
      {step.type === "EMOM" && (
        <WodEMOM
          step={step}
          onEnd={(config) => {
            step.config = config;
            onEnd(step);
          }}
        />
      )}
    </View>
  );
};
