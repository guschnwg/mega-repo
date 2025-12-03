import React from "react";

import { View, type ViewProps } from "react-native";

export const Header = ({
  style,
  children,
}: React.PropsWithChildren<ViewProps>) => (
  <View
    style={[
      {
        height: 100,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row",
        gap: 10,
      },
      style,
    ]}
  >
    {children}
  </View>
);
