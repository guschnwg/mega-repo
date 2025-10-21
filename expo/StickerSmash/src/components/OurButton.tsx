import React from "react";
import { Pressable, Text, PressableProps, ViewStyle } from "react-native";
import { styles } from "../styles";

const OurButton = ({ children, style, ...props }: React.PropsWithChildren<PressableProps & { title?: string }>) => {
  return (
    <Pressable
      style={({ pressed }) => ({
        backgroundColor: pressed ? styles.secondaryDark : styles.secondary,
        padding: 10,
        borderRadius: styles.radius,
        justifyContent: 'center',
        alignItems: "center",
        borderWidth: 1,
        borderColor: styles.secondaryDark,
        ...(style as ViewStyle),
      })}
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
}

export { OurButton };
