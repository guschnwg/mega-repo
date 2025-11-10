import React from "react";
import { Pressable, Text } from "react-native";

import { styles } from "@/src/styles";

interface PressableTextProps {
  text: string | number;
  onPress: () => void;
}

export const PressableText = ({ text, onPress }: PressableTextProps) => (
  <Pressable
    style={{
      borderRadius: styles.radius,
      borderColor: styles.primary,
      borderWidth: 1,
      padding: 5,
    }}
    onPress={onPress}
  >
    <Text
      style={{
        textAlign: "center",
        fontSize: 16,
      }}
    >
      {text}
    </Text>
  </Pressable>
);
