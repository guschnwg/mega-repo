import React from "react";
import { ScrollView, Text, View } from "react-native";

import { styles } from '../styles';
import { OurButton } from "../components/OurButton";
import { LayoutAware } from "../components/LayoutAware";
import { Chart } from "../components/Chart";

export const EndWod = ({ steps, onReset }: { steps: StepType[], onReset: () => void }) => (
  <ScrollView
    style={{
      flex: 1,
      backgroundColor: styles.background,
    }}
    contentContainerStyle={{
      flexDirection: 'column',
      gap: 20,
      paddingInline: 50,
      paddingBlock: 20,
    }}
  >
    <OurButton
      title="Reset"
      onPress={onReset}
    />

    {steps.map((step, i) => {
      if (step.type === 'Rest') {
        return (
          <View
            key={i}
            style={{
              gap: 10,
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontWeight: 'bold'
              }}
            >
              Rested for {step.counter.value || step.endTime}s
            </Text>
          </View>
        );
      } else if (step.type === 'Wait') {
        return (
          <View
            key={i}
            style={{
              gap: 10,
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontWeight: 'bold'
              }}
            >
              Waited for {step.counter.value}s
            </Text>
          </View>
        );
      }

      return (
        <View
          key={i}
          style={{
            gap: 10,
          }}
        >
          <Text>{step.counter.value} reps in {step.endTime} seconds</Text>

          <LayoutAware key={i} height={100}>
            {({ ready, ...rest }) => ready && (
              <Chart
                {...rest}
                counter={step.counter}
                currentTime={step.endTime}
                endTime={step.endTime}
              />
            )}
          </LayoutAware>
        </View>
      )
    })}
  </ScrollView>
);
