import React, { useRef, useState, useLayoutEffect } from "react";
import { useWindowDimensions, View } from "react-native";

export const LayoutAware = ({
  height,
  children,
}: {
  height: number;
  children: ({
    ready,
    height,
    width,
  }: {
    ready: boolean;
    height: number;
    width: number;
  }) => React.ReactNode;
}) => {
  const dimensions = useWindowDimensions();
  const ref = useRef<View>(null);
  const [layout, setDimensions] = useState({
    ready: false,
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  useLayoutEffect(() => {
    // Give some time because sometimes it bugs
    setTimeout(() => {
      ref.current?.measureInWindow((x, y, width, height) => {
        setDimensions({ ready: true, x, y, width, height });
      });
    }, 100);
  }, [dimensions]);

  return (
    <View
      ref={ref}
      style={{
        height,
        alignSelf: "stretch",
      }}
    >
      {children(layout)}
    </View>
  );
};
