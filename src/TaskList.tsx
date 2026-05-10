import type { ScrollBoxRenderable } from "@opentui/core";
import { forwardRef, type ReactNode } from "react";
import { colors } from "./globals";

export type TaskListProps = {
  title: string;
  focused?: boolean;
  children?: ReactNode;
};

export const TaskList = forwardRef<ScrollBoxRenderable, TaskListProps>(
  ({ title, focused: focused = false, children }: TaskListProps, ref) => {
    return (
      <scrollbox
        ref={ref}
        title={title}
        titleAlignment="center"
        borderStyle="rounded"
        borderColor={focused ? colors.accent : undefined}
        height={"100%"}
        width={"25%"}
        paddingRight={3}
      >
        {children}
      </scrollbox>
    );
  },
);
