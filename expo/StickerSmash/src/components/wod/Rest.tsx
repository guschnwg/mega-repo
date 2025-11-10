import React, { useState } from "react";
import { Text, View } from "react-native";

import { styles } from "../../styles";
import { Countdown } from "../Countdown";
import { OurButton } from "../OurButton";

export const WodRest = ({
  step,
  onSkip,
  onEnd,
}: {
  step: RestStepType;
  onSkip: (value: number) => void;
  onEnd: () => void;
}) => {
  const [startTime] = useState(Date.now());

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: styles.background,
        gap: 50,
      }}
    >
      <Text
        style={{
          fontSize: 48,
          color: styles.textDark,
        }}
      >
        Rest time!
      </Text>

      <Countdown time={step.config.time} onFinish={onEnd} />

      <OurButton
        title="Skip"
        onPress={() => onSkip((Date.now() - startTime) / 1000)}
      />
    </View>
  );
};
