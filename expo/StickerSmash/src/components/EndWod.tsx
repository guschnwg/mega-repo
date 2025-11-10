import React from "react";
import { ScrollView, Text, View } from "react-native";

import { styles } from "../styles";
import { OurButton } from "../components/OurButton";
import { LayoutAware } from "../components/LayoutAware";
import { Chart } from "../components/Chart";

export const EndWod = ({
  steps,
  onReset,
}: {
  steps: StepType[];
  onReset: () => void;
}) => (
  <ScrollView
    style={{
      flex: 1,
      backgroundColor: styles.background,
    }}
    contentContainerStyle={{
      flexDirection: "column",
      gap: 20,
      paddingInline: 50,
      paddingBlock: 20,
    }}
  >
    <OurButton title="Reset" onPress={onReset} />

    {steps.map((step, i) => {
      if (step.type === "Rest") {
        return (
          <View
            key={i}
            style={{
              gap: 10,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Rested for {step.config.actual || step.config.time}s
            </Text>
          </View>
        );
      } else if (step.type === "Wait") {
        return (
          <View
            key={i}
            style={{
              gap: 10,
            }}
          >
            <Text
              style={{
                textAlign: "center",
                fontWeight: "bold",
              }}
            >
              Waited for {step.config.actual || step.config.time}s
            </Text>
          </View>
        );
      } else if (step.type === "AMRAP") {
        return (
          <View
            key={i}
            style={{
              gap: 10,
            }}
          >
            <Text>
              {step.config.counter.value} reps in {step.config.time} seconds
            </Text>

            <LayoutAware key={i} height={100}>
              {({ ready, ...rest }) =>
                ready && (
                  <Chart
                    {...rest}
                    counter={step.config.counter}
                    currentTime={step.config.time}
                    endTime={step.config.time}
                  />
                )
              }
            </LayoutAware>
          </View>
        );
      }

      return (
        <Text key={i}>Not implemented yet {JSON.stringify(step, null, 2)}</Text>
      );
    })}
  </ScrollView>
);
