import React, { useState } from "react";
import { Text, View } from "react-native";

import { TextPicker } from "@/src/components/TextPicker";
import { Holdable } from "@/src/components/Holdable";
import { OurButton } from "../OurButton";
import { styles } from "@/src/styles";

interface ConfigureEMOMProps {
  step: EMOMStepType;
  onUpdate: (step: EMOMStepType) => void;
}

const SimpleEdit = ({ step, onUpdate }: ConfigureEMOMProps) => {
  const minutes = Math.floor(step.config.counters[0].time / 1000 / 60);
  const seconds = Math.floor(step.config.counters[0].time / 1000 % 60)
    .toString()
    .padStart(2, "0");

  return (
    <>
      <TextPicker
        value={step.config.counters[0].max || 0}
        possible={[5, 10, 15, 20, 25, 30]}
        onUpdate={(value) => {
          step.config.counters.forEach((counter) => (counter.max = value));
          onUpdate(step);
        }}
      />
      <Text
        style={{
          fontSize: styles.fontSize,
        }}
      >reps in</Text>
      <TextPicker
        value={step.config.counters[0].time || 0}
        possible={[5, 10, 15, 20, 25, 30]}
        text={minutes === 0 ? `${seconds}s` : `${minutes}:${seconds}`}
        onUpdate={(value) => {
          step.config.counters.forEach((counter) => (counter.time = value * 1000));
          onUpdate(step);
        }}
      />
      <Text
        style={{
          fontSize: styles.fontSize,
        }}
      >for</Text>
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
      <Text
        style={{
          fontSize: styles.fontSize,
        }}
      >times</Text>
    </>
  );
};

const AdvancedEdit = ({ step, onUpdate }: ConfigureEMOMProps) => {
  return (
    <View
      style={{
        flexDirection: "column",
        gap: 10,
        padding: 10,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {step.config.counters.map((counter, index) => {
        const minutes = Math.floor(counter.time / 1000 / 60);
        const seconds = Math.floor(counter.time / 1000 % 60)
          .toString()
          .padStart(2, "0");

        return (
          <View
            key={index}
            style={{
              flexDirection: "row",
              gap: 5,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TextPicker
              value={counter.max || 0}
              possible={[5, 10, 15, 20, 25, 30]}
              onUpdate={(value) => {
                counter.max = value;
                onUpdate(step);
              }}
            />
            <Text
              style={{
                fontSize: styles.fontSize,
              }}
            >
              reps in
            </Text>
            <TextPicker
              value={counter.time || 0}
              possible={[5, 10, 15, 20, 25, 30]}
              text={minutes === 0 ? `${seconds}s` : `${minutes}:${seconds}`}
              onUpdate={(value) => {
                counter.time = value * 1000;
                onUpdate(step);
              }}
            />
            <OurButton
              title="X"
              onPress={() => {
                step.config.counters.splice(index, 1);
                onUpdate(step);
              }}
            />
            <OurButton
              title="+"
              style={{
                opacity: index === step.config.counters.length - 1 ? 1 : 0,
              }}
              disabled={index !== step.config.counters.length - 1}
              onPress={() => {
                step.config.counters.push(step.config.counters[index]);
                onUpdate(step);
              }}
            />
          </View>
        );
      })}
    </View>
  );
};

export const ConfigureEMOM = ({ step, onUpdate }: ConfigureEMOMProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const keyFn = (counter: EMOMConfigCounterType) =>
    `${counter.max}-${counter.time}`;

  const allSame = Boolean(
    step.config.counters.reduce(
      (prev, curr) => (prev !== keyFn(curr) ? "" : keyFn(curr)),
      keyFn(step.config.counters[0]),
    ),
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
      {allSame && !isOpen ? (
        <SimpleEdit step={step} onUpdate={onUpdate} />
      ) : (
        <AdvancedEdit step={step} onUpdate={onUpdate} />
      )}
    </Holdable>
  );
};
