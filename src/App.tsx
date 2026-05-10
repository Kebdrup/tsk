import { useMemo, useRef, useState } from "react";
import { useKeyboard } from "@opentui/react";
import {
  TextAttributes,
  type CliRenderer,
  type ScrollBoxRenderable,
} from "@opentui/core";
import { TaskList } from "./TaskList";
import { TaskItem } from "./TaskItem";
import { TaskStatus, useTasks } from "./useTasks";

export const openEditor = async (renderer: CliRenderer, filePath: string) => {
  const editor = process.env["EDITOR"] ?? "vim";
  renderer.suspend();
  Bun.spawn([editor, filePath], {
    stdio: ["inherit", "inherit", "inherit"],
    onExit: () => {
      renderer.resume();
    },
  });
};

export type AppProps = {
  renderer: CliRenderer;
};

type ScrollBoxRef = ScrollBoxRenderable | null;

export const App = ({ renderer }: AppProps) => {
  const scrollBoxes = useRef<
    [ScrollBoxRef, ScrollBoxRef, ScrollBoxRef, ScrollBoxRef]
  >([null, null, null, null]);
  const [focusedMenuIndex, setFocusedMenuIndex] = useState(0);
  const [focusedItemIndex, setFocusedItemIndex] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  const { tasks, changeTaskStatus, swapTasks } = useTasks();

  useKeyboard((key) => {
    const currentStatus = TaskStatus[focusedMenuIndex as TaskStatus];
    const currentTasks = tasks[currentStatus as keyof typeof tasks];
    const currentMenuScrollBox = scrollBoxes.current[focusedMenuIndex];

    // Quit
    if (key.name === "q") {
      renderer.destroy();
      process.exit(0);
    }
    // Edit task
    if (key.name === "e") {
      openEditor(renderer, "/tmp/example.txt");
    }
    // Navigate down
    if (key.name === "j") {
      if (focusedItemIndex >= currentTasks.length - 1) {
        return;
      }
      if (key.shift) {
        const nextItemIndex = focusedItemIndex + 1;
        if (currentTasks[focusedItemIndex] && currentTasks[nextItemIndex]) {
          swapTasks(
            currentTasks[focusedItemIndex],
            currentTasks[nextItemIndex],
          );
        }
      }
      const nextTask = currentTasks[focusedItemIndex + 1];
      if (currentMenuScrollBox != null && nextTask !== undefined) {
        setFocusedItemIndex((prev) => prev + 1);
        currentMenuScrollBox.scrollChildIntoView(String(nextTask.id));
      }
    }
    // Navigate up
    if (key.name === "k") {
      if (focusedItemIndex === 0) {
        return;
      }
      if (key.shift) {
        const prevItemIndex = focusedItemIndex - 1;
        if (currentTasks[focusedItemIndex] && currentTasks[prevItemIndex]) {
          swapTasks(
            currentTasks[focusedItemIndex],
            currentTasks[prevItemIndex],
          );
        }
      }
      const nextTask = currentTasks[focusedItemIndex - 1];
      if (currentMenuScrollBox != null && nextTask !== undefined) {
        setFocusedItemIndex((prev) => prev - 1);
        currentMenuScrollBox.scrollChildIntoView(String(nextTask.id));
      }
    }
    // Navigate left
    if (key.name === "h" || key.name === "left") {
      if (focusedMenuIndex === 0) {
        return;
      }
      if (key.shift) {
        if (currentTasks[focusedItemIndex]) {
          changeTaskStatus(
            currentTasks[focusedItemIndex],
            (focusedMenuIndex - 1) as TaskStatus,
          );
        }
      }
      setFocusedMenuIndex((prev) => prev - 1);
      setFocusedItemIndex(0);
      const nextMenuScrollBox = scrollBoxes.current[focusedMenuIndex - 1];
      nextMenuScrollBox?.scrollTo(0);
    }
    // Navigate right
    if (key.name === "l" || key.name === "right") {
      if (focusedMenuIndex === 3) {
        return;
      }
      if (key.shift) {
        if (currentTasks[focusedItemIndex] && focusedMenuIndex < 3) {
          changeTaskStatus(
            currentTasks[focusedItemIndex],
            (focusedMenuIndex + 1) as TaskStatus,
          );
        }
      }
      setFocusedMenuIndex((prev) => prev + 1);
      setFocusedItemIndex(0);
      const nextMenuScrollBox = scrollBoxes.current[focusedMenuIndex + 1];
      nextMenuScrollBox?.scrollTo(0);
    }
    // Show help
    if (key.name === "?") {
      setShowHelp((prev) => !prev);
    }
    if (key.name === "c") {
      renderer.console.toggle();
    }
  });

  const taskItemWidth = useMemo(() => renderer.width / 4 - 6, []);

  return (
    <box flexGrow={1}>
      <box
        visible={showHelp}
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
      <box flexDirection="row" height="30%">
        <TaskList
          ref={(ref) => {
            scrollBoxes.current[0] = ref;
          }}
          title="TODO"
          focused={focusedMenuIndex === 0}
        >
          {tasks.todo.map((task, index) => (
            <TaskItem
              id={String(task.id)}
              key={task.id}
              title={task.title}
              width={taskItemWidth}
              focused={focusedMenuIndex === 0 && focusedItemIndex === index}
            />
          ))}
        </TaskList>
        <TaskList
          ref={(ref) => {
            scrollBoxes.current[1] = ref;
          }}
          title="IN PROGRESS"
          focused={focusedMenuIndex === 1}
        >
          {tasks.inProgress.map((task, index) => (
            <TaskItem
              id={String(task.id)}
              key={task.id}
              title={task.title}
              width={taskItemWidth}
              focused={focusedMenuIndex === 1 && focusedItemIndex === index}
            />
          ))}
        </TaskList>
        <TaskList
          ref={(ref) => {
            scrollBoxes.current[2] = ref;
          }}
          title="BLOCKED"
          focused={focusedMenuIndex === 2}
        >
          {tasks.blocked.map((task, index) => (
            <TaskItem
              id={String(task.id)}
              key={task.id}
              title={task.title}
              width={taskItemWidth}
              focused={focusedMenuIndex === 2 && focusedItemIndex === index}
            />
          ))}
        </TaskList>
        <TaskList
          ref={(ref) => {
            scrollBoxes.current[3] = ref;
          }}
          title="DONE"
          focused={focusedMenuIndex === 3}
        >
          {tasks.done.map((task, index) => (
            <TaskItem
              id={String(task.id)}
              key={task.id}
              title={task.title}
              width={taskItemWidth}
              focused={focusedMenuIndex === 3 && focusedItemIndex === index}
            />
          ))}
        </TaskList>
      </box>
      <box borderStyle="rounded" flexGrow={1}>
        <text attributes={TextAttributes.DIM}>What the will you build?</text>
      </box>
    </box>
  );
};
