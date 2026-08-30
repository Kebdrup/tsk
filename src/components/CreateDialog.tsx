import { colors } from "../globals";
import { useState } from "react";
import { TaskStatus } from "../store/taskStore";

export type CreateDialogProps = {
  status: TaskStatus;
  createTask: (title: string) => void;
};

export const CreateDialog = ({ status, createTask }: CreateDialogProps) => {
  const [title, setTitle] = useState<string | null>(null);
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
      title="Create"
      titleAlignment="center"
    >
      <text marginLeft={1}>Title:</text>
      <box borderStyle="rounded" height={3} marginLeft={1} marginRight={1}>
        <input
          focused
          onInput={(value) => {
            setTitle(value.length > 0 ? value : null);
          }}
          onKeyDown={(key) => {
            if (key.name === "return") {
              if (title !== null) {
                createTask(title);
              }
            }
          }}
        />
      </box>
      <text marginLeft={1}>Status: {TaskStatus[status].toUpperCase()}</text>
    </box>
  );
};
