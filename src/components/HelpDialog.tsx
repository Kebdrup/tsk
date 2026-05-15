export type HelpDialogProps = {
  show?: boolean;
};

export const HelpDialog = ({ show }: HelpDialogProps) => {
  return (
    <box
      visible={show}
      position="absolute"
      top={"25%"}
      left={"30%"}
      width={"40%"}
      height={"50%"}
      borderStyle="rounded"
      backgroundColor="black"
      zIndex={10}
    >
      <text>Hello</text>
    </box>
  );
};
