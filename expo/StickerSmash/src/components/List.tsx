import React, { ReactNode, useState } from 'react';

import { ScrollView, Vibration } from 'react-native';

import { styles } from '@/src/styles';
import { Slidable } from '@/src/components/Slidable';

export function List<T extends { id: number, component: ReactNode }>({ ref, items, canRemove, onRemove }: { ref: React.Ref<ScrollView>, items: T[], canRemove: (index: number) => boolean, onRemove: (index: number) => void }) {
  const [canScroll, setCanScroll] = useState(true);
  const [scrolling, setScrolling] = useState(false);

  return (
    <ScrollView
      ref={ref}
      contentContainerStyle={{
        backgroundColor: styles.background,
        padding: 10,
        gap: 10,
      }}
      scrollEnabled={canScroll}
      onScrollBeginDrag={() => setScrolling(true)}
      onScrollEndDrag={() => setScrolling(false)}
      onScrollAnimationEnd={() => setScrolling(false)}
    >
      {items.map((item, idx) => (
        <Slidable
          key={item.id}
          style={{
            flexDirection: "row",
            alignItems: "stretch",
            justifyContent: "center",
            minHeight: 60,
          }}
          canSlide={!scrolling && canRemove(idx)}
          onSlideStart={() => setCanScroll(false)}
          onSlideEnd={() => setCanScroll(true)}
          onSlide={() => {
            Vibration.vibrate(100);
            onRemove(idx);
            setCanScroll(true);
          }}
        >
          {item.component}
        </Slidable>
      ))}
    </ScrollView>
  )
};
