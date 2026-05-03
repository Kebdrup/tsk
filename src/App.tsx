import { createContext, useMemo, useRef, useState } from "react";
import { useKeyboard } from "@opentui/react";
import {
  TextAttributes,
  type CliRenderer,
  type ScrollBoxRenderable,
} from "@opentui/core";
import { TaskList } from "./TaskList";
import { TaskItem } from "./TaskItem";
import { useTasks } from "./useTasks";

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

export const App = ({ renderer }: AppProps) => {
  const scrollBox = useRef<ScrollBoxRenderable>(null);
  const [showHelp, setShowHelp] = useState(false);

  const { tasks } = useTasks();

  useKeyboard((key) => {
    if (key.name === "q") {
      renderer.destroy();
      process.exit(0);
    }
    if (key.name === "e") {
      openEditor(renderer, "/tmp/example.txt");
    }
    if (key.name === "j") {
      scrollBox.current?.scrollBy(1, "absolute");
    }
    if (key.name === "k") {
      scrollBox.current?.scrollBy(-1, "absolute");
    }
    if (key.name === "?") {
      setShowHelp((prev) => !prev);
    }
  });

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
        <TaskList ref={scrollBox} title="TODO">
          {tasks.TODO.map((task) => (
            <TaskItem key={task.id} title={task.title} />
          ))}
        </TaskList>
        <TaskList ref={scrollBox} title="IN PROGRESS">
          {tasks.IN_PROGRESS.map((task) => (
            <TaskItem key={task.id} title={task.title} />
          ))}
        </TaskList>
        <TaskList ref={scrollBox} title="BLOCKED">
          {tasks.BLOCKED.map((task) => (
            <TaskItem key={task.id} title={task.title} />
          ))}
        </TaskList>
        <TaskList ref={scrollBox} title="DONE">
          {tasks.DONE.map((task) => (
            <TaskItem key={task.id} title={task.title} />
          ))}
        </TaskList>
      </box>
      <box borderStyle="rounded" flexGrow={1}>
        <text attributes={TextAttributes.DIM}>What the will you build?</text>
      </box>
    </box>
  );
};
