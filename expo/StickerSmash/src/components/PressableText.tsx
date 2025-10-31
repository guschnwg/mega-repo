import React from "react";
import { Pressable, Text } from "react-native";

import { styles } from '../styles';

export const PressableText = ({ text, onPress }: { text: string | number, onPress: () => void }) => (
  <Pressable
    style={{
      borderRadius: styles.radius,
      borderColor: styles.primary,
      borderWidth: 1,
      padding: 10,
    }}
    onPress={onPress}
  >
    <Text
      style={{
        textAlign: 'center',
        fontSize: 18,
      }}
    >
      {text}
    </Text>
  </Pressable>
);
