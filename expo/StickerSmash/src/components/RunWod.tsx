import React from "react";
import { Text, View } from "react-native";

import { WodAmrap } from "@/src/components/wod/AMRAP";
import { WodRest } from "@/src/components/wod/Rest";
import { WodWait } from "@/src/components/wod/Wait";
import { WodSet } from "@/src/components/wod/Set";
import { WodEMOM } from "@/src/components/wod/EMOM";
import { styles } from "@/src/styles";
import { Header } from "./Header";

interface Props {
  step: StepType;
  onEnd: (step: StepType) => void;
  onStop: () => void;
}

export const RunWod = ({ step, onEnd, onStop, }: Props) => {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: styles.background,
        gap: 50,
      }}
    >
      <Header>
        <Text
          style={{
            fontSize: 36,
            color: styles.textLight,
          }}
        >
          {step.type}
        </Text>
      </Header>

      {step.type === "AMRAP" && (
        <WodAmrap
          step={step}
          onEnd={(config) => {
            step.config = config;
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
