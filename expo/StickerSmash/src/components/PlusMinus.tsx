import { OurButton } from "./OurButton";

export const PlusMinus = ({ onMinus, onPlus, children }: React.PropsWithChildren<{ onMinus: () => void, onPlus: () => void }>) => (
  <>
    <OurButton
      title="-"
      style={{ width: 60, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderWidth: 0 }}
      onPress={onMinus}
    />
    {children}
    <OurButton
      title="+"
      style={{ width: 60, borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderWidth: 0 }}
      onPress={onPlus}
    />
  </>
);
