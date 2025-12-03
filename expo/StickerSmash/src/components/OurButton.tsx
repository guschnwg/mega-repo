import React from "react";
import {
  Pressable,
  Text,
  PressableProps,
  ViewStyle,
  Vibration,
  TextStyle,
} from "react-native";
import { styles } from "../styles";

const OurButton = ({
  children,
  style,
  onPressIn,
  titleStyle,
  variant = "primary",
  ...props
}: React.PropsWithChildren<
  PressableProps & {
    title?: string;
    onPressIn?: PressableProps["onPressIn"];
    titleStyle?: TextStyle;
    variant?:
      | "primary"
      | "secondary"
      | "primary-inverted"
      | "secondary-inverted";
  }
>) => {
  return (
    <Pressable
      style={({ pressed }) => ({
        backgroundColor: (function () {
          if (variant === "primary") {
            return pressed ? styles.secondaryDark : styles.secondary;
          }
          if (variant === "secondary") {
            return pressed ? styles.primaryDark : styles.primary;
          }
          if (variant === "primary-inverted") {
            return pressed ? styles.secondary : styles.secondaryDark;
          }
          if (variant === "secondary-inverted") {
            return pressed ? styles.primary : styles.primaryDark;
          }
          return "red";
        })(),
        padding: 10,
        borderRadius: styles.radius,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: (function () {
          if (variant === "primary") {
            return styles.secondaryDark;
          }
          if (variant === "secondary") {
            return styles.primaryDark;
          }
          if (variant === "primary-inverted") {
            return styles.secondaryDark;
          }
          if (variant === "secondary-inverted") {
            return styles.primaryDark;
          }
          return "red";
        })(),
        ...(style as ViewStyle),
      })}
      onPressIn={(event) => {
        Vibration.vibrate(1);
        onPressIn?.(event);
      }}
      {...props}
    >
      <Text
        style={[
          {
            color: styles.textLight,
            fontWeight: styles.bold,
            fontSize: styles.fontSize,
          },
          titleStyle,
        ]}
      >
        {children || props.title}
      </Text>
    </Pressable>
  );
};

export { OurButton };
