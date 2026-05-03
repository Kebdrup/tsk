import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "./App";
import { Database } from "bun:sqlite";

const DATABASE_PATH = process.env["HOME"] + "/.local/share/tin/data.db";
export const db_ = new Database(DATABASE_PATH);

const renderer = await createCliRenderer({
  screenMode: "alternate-screen",
});

process.on("SIGTERM", () => {
  renderer.destroy();
  process.exit(0);
});

createRoot(renderer).render(<App renderer={renderer} />);
