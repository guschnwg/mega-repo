import React, { useRef } from "react";

import { Picker } from '@react-native-picker/picker';

import { PressableText } from './PressableText';

export function TextPicker<T extends React.Key>({ value, possible, text, onUpdate }: { value: T, possible: T[], text?: string, onUpdate: (value: T) => void }) {
  const ref = useRef<Picker<T>>(null);

  return (
    <>
      <Picker
        ref={ref}
        style={{ display: 'none' }}
        selectedValue={value}
        onValueChange={onUpdate}
      >
        {possible.map(i => <Picker.Item key={i} label={String(i)} value={i} />)}
      </Picker>

      <PressableText
        text={text || String(value)}
        onPress={() => ref.current?.focus()}
      />
    </>
  )
}