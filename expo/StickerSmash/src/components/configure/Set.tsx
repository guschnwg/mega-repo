import React, { useState } from "react";
import { Text, View } from "react-native";

import { TextPicker } from "../TextPicker";
import { OurButton } from "../OurButton";
import { Holdable } from "../Holdable";

interface ConfigureSetProps {
  step: SetStepType;
  onUpdate: (step: SetStepType) => void;
}

export const ConfigureSet = ({ step, onUpdate }: ConfigureSetProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const sameCountSteps = Boolean(
    step.config.counters.reduce(
      (prev, curr) => (prev !== curr.max ? 0 : curr.max),
      step.config.counters[0].max,
    ),
  );

  const AdvancedEdit = (
    <View
      style={{
        padding: 5,
        gap: 5,
        flexDirection: "row",
        alignItems: "center",
      }}
    >
      <Text>Reps of</Text>
      {step.config.counters.map((counter, index) => (
        <TextPicker
          key={index}
          value={counter.max || 0}
          possible={[5, 10, 15, 20, 25, 30]}
          onUpdate={(value) => {
            step.config.counters[index].max = value;
            onUpdate(step);
          }}
        />
      ))}
      <OurButton
        title="+"
        onPress={() => {
          step.config.counters.push(
            JSON.parse(JSON.stringify(step.config.counters[0])),
          );
          onUpdate(step);
        }}
      />
    </View>
  );

  const SimpleEdit = (
    <>
      <TextPicker
        value={step.config.counters.length}
        possible={[1, 2, 3, 4, 5, 6]}
        onUpdate={(value) => {
          step.config.counters = Array(value).fill(
            JSON.parse(JSON.stringify(step.config.counters[0])),
          );
          onUpdate(step);
        }}
      />
      <Text>sets of</Text>
      <TextPicker
        value={step.config.counters[0].max || 0}
        possible={[5, 10, 15, 20, 25, 30]}
        onUpdate={(value) => {
          step.config.counters.forEach((counter) => (counter.max = value));
          onUpdate(step);
        }}
      />
      <Text>reps</Text>
    </>
  );

  return (
    <Holdable
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: 5,
      }}
      onHold={() => setIsOpen((prev) => !prev)}
    >
      {sameCountSteps && !isOpen ? SimpleEdit : AdvancedEdit}
    </Holdable>
  );
};
