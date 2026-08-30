import type { ReactNode } from "react";
import { colors } from "../globals";
import { useKeyboard } from "@opentui/react";

export type ConfirmDialogProps = {
  content: ReactNode;
  onAccept: () => void;
  onDeny: () => void;
};

export const ConfirmDialog = ({
  content,
  onAccept,
  onDeny,
}: ConfirmDialogProps) => {
  useKeyboard((key) => {
    switch (key.name) {
      case "y":
        onAccept();
        break;
      case "n":
        onDeny();
        break;
      default:
        key.stopPropagation();
        key.preventDefault();
    }
  });

  return (
    <box
      position="absolute"
      top={"25%"}
      left={"30%"}
      width={"40%"}
      borderStyle="rounded"
      borderColor={colors.accentPrimary}
      backgroundColor="black"
      zIndex={10}
      paddingLeft={1}
      paddingRight={1}
      title="Confirm"
      titleAlignment="center"
      flexDirection="column"
    >
      <box>{content}</box>
      <text marginLeft="auto" marginRight="auto">
        [Y]es / [N]o
      </text>
    </box>
  );
};
