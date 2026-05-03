import type { ScrollBoxRenderable } from "@opentui/core";
import { forwardRef, type ReactNode } from "react";

export type TaskListProps = {
  title: string;
  children?: ReactNode;
};

export const TaskList = forwardRef<ScrollBoxRenderable, TaskListProps>(
  ({ title, children }: TaskListProps, ref) => {
    return (
      <scrollbox
        ref={ref}
        title={title}
        titleAlignment="center"
        borderStyle="rounded"
        height={"100%"}
        flexGrow={1}
        maxWidth={"25%"}
        paddingRight={3}
        paddingTop={1}
        paddingBottom={1}
      >
        {children}
      </scrollbox>
    );
  },
);
