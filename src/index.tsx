import { ConsolePosition, createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "./App";
import { useTaskStore } from "./store/taskStore";

const renderer = await createCliRenderer({
  screenMode: "alternate-screen",
  consoleMode: "console-overlay",
  consoleOptions: {
    position: ConsolePosition.BOTTOM,
    sizePercent: 30,
  },
});

useTaskStore.getState().initialize(renderer);

const root = createRoot(renderer);
root.render(<App renderer={renderer} />);
renderer.start();
