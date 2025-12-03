import React, { useEffect, useRef } from "react"
import { ScrollView } from "react-native"

interface Props {
  current: number
  width: number
  itemSize: number
}

export const ScrollCenter = ({ current, width, itemSize, children }: React.PropsWithChildren<Props>) => {
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef?.current?.scrollTo({ x: current * itemSize, y: 0 });
  }, [current, itemSize]);

  return (
    <ScrollView
      horizontal
      ref={scrollRef}
      scrollEnabled={false}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        flexDirection: "row",
        alignItems: 'center',
        paddingInline: width / 2 - itemSize / 2,
      }}
    >
      {children}
    </ScrollView>
  )
}