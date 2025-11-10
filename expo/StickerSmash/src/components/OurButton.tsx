import React from "react";
import {
  Pressable,
  Text,
  PressableProps,
  ViewStyle,
  Vibration,
} from "react-native";
import { styles } from "../styles";

const OurButton = ({
  children,
  style,
  onPressIn,
  ...props
}: React.PropsWithChildren<
  PressableProps & { title?: string; onPressIn?: PressableProps["onPressIn"] }
>) => {
  return (
    <Pressable
      style={({ pressed }) => ({
        backgroundColor: pressed ? styles.secondaryDark : styles.secondary,
        padding: 10,
        borderRadius: styles.radius,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: styles.secondaryDark,
        ...(style as ViewStyle),
      })}
      onPressIn={(event) => {
        Vibration.vibrate(1);
        onPressIn?.(event);
      }}
      {...props}
    >
      <Text
        style={{
          color: styles.textLight,
          fontWeight: styles.bold,
          fontSize: styles.fontSize,
        }}
      >
        {children || props.title}
      </Text>
    </Pressable>
  );
};

export { OurButton };
