import { useCallback, useMemo, useRef, useState } from "react";
import { useKeyboard } from "@opentui/react";
import {
  getTreeSitterClient,
  type CliRenderer,
  type ScrollBoxRenderable,
} from "@opentui/core";
import { TaskList } from "./components/TaskList";
import { TaskItem } from "./components/TaskItem";
import { TaskStatus, useTasks } from "./useTasks";
import { colors, markdownStyles } from "./globals";
import { HelpDialog } from "./components/HelpDialog";
import { CreateDialog } from "./components/CreateDialog";
import { ConfirmDialog } from "./components/ConfirmDialog";

export type AppProps = {
  renderer: CliRenderer;
};

enum AppMode {
  default = 0,
  createTask = 1,
}

type ScrollBoxRef = ScrollBoxRenderable | null;

export const App = ({ renderer }: AppProps) => {
  const scrollBoxes = useRef<
    [ScrollBoxRef, ScrollBoxRef, ScrollBoxRef, ScrollBoxRef]
  >([null, null, null, null]);
  const [appMode, setAppMode] = useState<AppMode>(AppMode.default);
  const [focusedMenuIndex, setFocusedMenuIndex] = useState(0);
  const [focusedItemIndex, setFocusedItemIndex] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const treeSitterClient = useMemo(() => getTreeSitterClient(), []);

  const {
    tasks,
    changeTaskStatus,
    swapTasks,
    editTask,
    createTask,
    deleteTask,
  } = useTasks(renderer);

  const markdownStyle = useMemo(() => {
    return markdownStyles;
  }, []);

  const { selectedStatus, selectedTasks, selectedTask } = useMemo(() => {
    const selectedStatusLabel = TaskStatus[focusedMenuIndex as TaskStatus];
    const selectedTasks = tasks[selectedStatusLabel as keyof typeof tasks];
    const selectedTask =
      tasks[selectedStatusLabel as keyof typeof tasks][focusedItemIndex];
    return {
      selectedStatus: focusedMenuIndex as TaskStatus,
      selectedTasks,
      selectedTask,
    };
  }, [focusedMenuIndex, focusedItemIndex, tasks]);

  useKeyboard((key) => {
    console.log("Key pressed:", key);
    switch (appMode) {
      case AppMode.createTask:
        // Close create dialog
        if (key.name === "q" || key.name === "escape") {
          setAppMode(AppMode.default);
          setShowCreate(false);
        }
        break;
      case AppMode.default: {
        const currentMenuScrollBox = scrollBoxes.current[focusedMenuIndex];

        // Quit
        if (key.name === "q") {
          renderer.destroy();
        }
        // Edit task
        if (key.name === "e" || key.name === "return") {
          if (selectedTask !== undefined) {
            editTask(selectedTask);
          }
        }
        // Navigate down
        if (key.name === "j") {
          if (focusedItemIndex >= selectedTasks.length - 1) {
            return;
          }
          if (key.shift) {
            const nextItemIndex = focusedItemIndex + 1;
            if (
              selectedTasks[focusedItemIndex] &&
              selectedTasks[nextItemIndex]
            ) {
              swapTasks(
                selectedTasks[focusedItemIndex],
                selectedTasks[nextItemIndex],
              );
            }
          }
          const nextTask = selectedTasks[focusedItemIndex + 1];
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
            if (
              selectedTasks[focusedItemIndex] &&
              selectedTasks[prevItemIndex]
            ) {
              swapTasks(
                selectedTasks[focusedItemIndex],
                selectedTasks[prevItemIndex],
              );
            }
          }
          const nextTask = selectedTasks[focusedItemIndex - 1];
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
            if (selectedTasks[focusedItemIndex]) {
              changeTaskStatus(
                selectedTasks[focusedItemIndex],
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
            if (selectedTasks[focusedItemIndex] && focusedMenuIndex < 3) {
              changeTaskStatus(
                selectedTasks[focusedItemIndex],
                (focusedMenuIndex + 1) as TaskStatus,
              );
            }
          }
          setFocusedMenuIndex((prev) => prev + 1);
          setFocusedItemIndex(0);
          const nextMenuScrollBox = scrollBoxes.current[focusedMenuIndex + 1];
          nextMenuScrollBox?.scrollTo(0);
        }
        if (key.name === "a") {
          setAppMode(AppMode.createTask);
          setShowCreate(true);
        }
        if (key.name === "x" || key.name === "d") {
          if (selectedTask !== undefined) {
            setShowDelete(true);
          }
        }
        // Show help
        if (key.name === "?") {
          setShowHelp((prev) => !prev);
        }
        if (key.name === "c") {
          renderer.console.toggle();
        }
        break;
      }
    }
  });

  const createTaskFromTitle = useCallback(
    (title: string) => {
      createTask(title, selectedStatus, focusedItemIndex);
      setShowCreate(false);
      setAppMode(AppMode.default);
    },
    [selectedStatus, focusedItemIndex],
  );

  const taskItemWidth = useMemo(() => renderer.width / 4 - 6, []);

  return (
    <box flexGrow={1}>
      <HelpDialog show={showHelp} />
      {showDelete && (
        <ConfirmDialog
          content={
            <box>
              <text>
                DELETE:{" "}
                <span fg={colors.accentPrimary}>{selectedTask?.title}</span>
              </text>
            </box>
          }
          onAccept={() => {
            if (selectedTask !== undefined) {
              deleteTask(selectedTask);
              if (focusedItemIndex === selectedTasks.length - 1) {
                setFocusedItemIndex((prev) => Math.max(prev - 1, 0));
              }
              setShowDelete(false);
            }
          }}
          onDeny={() => {
            setShowDelete(false);
          }}
        />
      )}
      {showCreate && (
        <CreateDialog
          status={selectedStatus}
          createTask={createTaskFromTitle}
        />
      )}
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
      <box borderStyle="rounded" flexGrow={1} paddingLeft={1} paddingRight={1}>
        {selectedTask !== undefined && (
          <markdown
            treeSitterClient={treeSitterClient}
            syntaxStyle={markdownStyle}
            content={selectedTask?.content}
          />
        )}
      </box>
    </box>
  );
};
