import { Database } from "bun:sqlite";

export const DATABASE_PATH = process.cwd() + "/.tsk.db";
export const db_ = new Database(DATABASE_PATH);

export const CREATE_DATABASE_SQL = `
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,
  status INTEGER DEFAULT 0,
  placement INTEGER DEFAULT 0,
  deleted BOOLEAN DEFAUL FALSE,
  project INTEGER DEFAULT 0,
  FOREIGN KEY(project) REFERENCES projects(id)
);
`

db_.run(CREATE_DATABASE_SQL);

export const SELECT_TASKS_SQL = `
SELECT id, title, content, status, placement
FROM tasks
WHERE deleted = false
ORDER BY status, placement ASC`

export const UPDATE_TASK_PLACEMENT_SQL = `
UPDATE tasks SET 
  placement = $placement
WHERE id = $id;`

export const UPDATE_TASK_TITLE_SQL = `
UPDATE tasks SET 
  title = $title
WHERE id = $id;`

export const UPDATE_TASK_STATUS_PLACEMENT_SQL = `
UPDATE tasks SET 
  status = $status,
  placement = $placement
WHERE id = $id;`

export const UPDATE_TASK_CONTENT_SQL = `
UPDATE tasks SET 
  content = $content
WHERE id = $id;`

export const INCREMENT_TASK_PLACEMENT_SQL = `
UPDATE tasks SET 
  placement = placement + 1
WHERE status = $status and placement >= $placement;`

export const DECREMENT_TASK_PLACEMENT_SQL = `
UPDATE tasks SET 
  placement = placement - 1
WHERE status = $status and placement >= $placement;`

export const CREATE_TASK_SQL = `
INSERT INTO tasks (title, content, status, placement, deleted)
VALUES ($title, "", $status, $placement, false)`

export const DELETE_TASK_SQL = `
UPDATE tasks SET 
  deleted = true
WHERE id = $id;`
