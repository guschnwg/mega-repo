import React, { useState } from "react";
import { Pressable, Text, ButtonProps, PressableProps } from "react-native";
import { styles } from "../styles";

const OurButton = ({ children, style, ...props }: React.PropsWithChildren<ButtonProps | PressableProps>) => {
  const [pressing, setPressing] = useState(false)

  return (
    <Pressable
      style={{
        backgroundColor: pressing ? styles.secondaryDark : styles.secondary,
        padding: 10,
        borderRadius: styles.radius,
        justifyContent: 'center',
        alignItems: "center",
        borderWidth: 1,
        borderColor: styles.secondaryDark,
        ...style,
      }}
      onPressIn={() => setPressing(true)}
      onPressOut={() => setPressing(false)}
      {...props}
    >
      <Text
        style={{
          color: styles.textLight,
          fontWeight: styles.bold,
          fontSize: styles.fontSize,
        }}
      >{children || (props as ButtonProps).title}</Text>
    </Pressable>
  );
}

export { OurButton };
