import { TextAttributes } from "@opentui/core";
import { colors } from "./globals";

export type TaskItemProps = {
  title: string;
  id?: string;
  width: number;
  focused?: boolean;
};

export const TaskItem = ({
  title,
  id,
  width,
  focused = false,
}: TaskItemProps) => {
  // Custom word wrap
  let wrappedTitle = "";
  const words = title.split(" ");
  let row = "";
  for (const word of words) {
    if (row.length + word.length >= width) {
      wrappedTitle += `${row.trim()}\n`;
      row = `${word} `;
    } else {
      row += `${word} `;
    }
  }
  if (row.length > 0) {
    wrappedTitle += row;
  }

  return (
    <box id={id} width={"100%"} flexDirection="row">
      <text width={2}>-</text>
      <text
        width={width}
        wrapMode="none"
        fg={focused ? colors.foregroundHighlight : colors.foreground}
        bg={focused ? colors.backgroundHighlight : colors.background}
        attributes={focused ? TextAttributes.BOLD : undefined}
      >
        {width ? wrappedTitle : title.trim()}
      </text>
    </box>
  );
};
