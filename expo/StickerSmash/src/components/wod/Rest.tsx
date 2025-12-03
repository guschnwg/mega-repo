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
      }}
    >
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Countdown
          time={step.config.time}
          onFinish={onEnd}
        />
      </View>

      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        }}
      >
        <Text
          style={{
            fontSize: 48,
            color: styles.textDark,
            textAlign: "center",
          }}
        >
          Rest time!
        </Text>

        <OurButton
          title="Skip"
          onPress={() => onSkip(Date.now() - startTime)}
        />
      </View>
    </View>
  );
};
