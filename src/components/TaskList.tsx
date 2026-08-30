import type { ScrollBoxRenderable } from "@opentui/core";
import { forwardRef, type ReactNode } from "react";
import { colors } from "../globals";
import { useKeyboard } from "@opentui/react";
import { useTasks } from "../useTasks";

export type TaskListProps = {
  title: string;
  focused?: boolean;
  children?: ReactNode;
};

export const TaskList = forwardRef<ScrollBoxRenderable, TaskListProps>(
  ({ title, focused: focused = false, children }: TaskListProps, ref) => {
    //useKeyboard((key) => {
    //  if (!focused) {
    //    return;
    //  }
    //  console.log("Key pressed:", key);
    //      // Edit task
    //      if (key.name === "e" || key.name === "return") {
    //        if (selectedTask !== undefined) {
    //          editTask(selectedTask);
    //        }
    //      }
    //      // Navigate down
    //      if (key.name === "j") {
    //        if (focusedItemIndex >= selectedTasks.length - 1) {
    //          return;
    //        }
    //        if (key.shift) {
    //          const nextItemIndex = focusedItemIndex + 1;
    //          if (
    //            selectedTasks[focusedItemIndex] &&
    //            selectedTasks[nextItemIndex]
    //          ) {
    //            swapTasks(
    //              selectedTasks[focusedItemIndex],
    //              selectedTasks[nextItemIndex],
    //            );
    //          }
    //        }
    //        const nextTask = selectedTasks[focusedItemIndex + 1];
    //        if (currentMenuScrollBox != null && nextTask !== undefined) {
    //          setFocusedItemIndex((prev) => prev + 1);
    //          currentMenuScrollBox.scrollChildIntoView(String(nextTask.id));
    //        }
    //      }
    //      // Navigate up
    //      if (key.name === "k") {
    //        if (focusedItemIndex === 0) {
    //          return;
    //        }
    //        if (key.shift) {
    //          const prevItemIndex = focusedItemIndex - 1;
    //          if (
    //            selectedTasks[focusedItemIndex] &&
    //            selectedTasks[prevItemIndex]
    //          ) {
    //            swapTasks(
    //              selectedTasks[focusedItemIndex],
    //              selectedTasks[prevItemIndex],
    //            );
    //          }
    //        }
    //        const nextTask = selectedTasks[focusedItemIndex - 1];
    //        if (currentMenuScrollBox != null && nextTask !== undefined) {
    //          setFocusedItemIndex((prev) => prev - 1);
    //          currentMenuScrollBox.scrollChildIntoView(String(nextTask.id));
    //        }
    //      }
    //      if (key.name === "a") {
    //        setAppMode(AppMode.createTask);
    //        setShowCreate(true);
    //      }
    //      if (key.name === "x" || key.name === "d") {
    //        if (selectedTask !== undefined) {
    //          setShowDelete(true);
    //        }
    //      }
    //    }
    //  }
    //});

    return (
      <scrollbox
        ref={ref}
        title={title}
        titleAlignment="center"
        borderStyle="rounded"
        borderColor={focused ? colors.accentPrimary : undefined}
        height={"100%"}
        width={"25%"}
        paddingRight={3}
      >
        {children}
      </scrollbox>
    );
  },
);
