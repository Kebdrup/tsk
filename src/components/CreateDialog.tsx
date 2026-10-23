import { colors } from "../globals";
import { useState } from "react";
import { TaskStatus } from "../store/taskStore";

export type CreateOrEditDialogProps = {
  status: TaskStatus;
  createTask: (title: string) => void;
  currentTitle?: string;
};

export const CreateOrEditDialog = ({
  status,
  createTask,
  currentTitle,
}: CreateOrEditDialogProps) => {
  const [title, setTitle] = useState<string | undefined>(currentTitle ?? "");
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
          value={"" + title}
          focused
          onInput={(value) => {
            if (value !== undefined) {
              setTitle(value.length > 0 ? value : "");
            }
          }}
          onKeyDown={(key) => {
            if (key.name === "return") {
              if (title !== undefined && title.length > 0) {
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
