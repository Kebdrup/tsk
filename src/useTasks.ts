import { useContext, useEffect, useMemo } from "react"
import { db_ } from "./index.js"

export const TaskStatus = {
  TODO: 0,
  IN_PROGRESS: 1,
  BLOCKED: 2,
  DONE: 3
} as const
export type TaskStatusType = keyof typeof TaskStatus

export type Task = {
  id: number
  title: string
  content: string
  status: TaskStatusType
  placement: number
}

export type TasksResult = {
  tasks: { [key in TaskStatusType]: Task[] };


}

//
//   std::string sql = "UPDATE " + TABLE_NAME +
//                    " SET "
//                    "title = ?,"
//                    "content = ?,"
//                    "status = ?,"
//                    "placement = ?"
//                    " WHERE id = ?";
//  if (!has_database_record_) {
//    sql = "INSERT INTO " + TABLE_NAME +
//          " (title, content, status, "
//          "placement) "
//          "VALUES (?, ?, ?, ?)";

export const useTasks = () => {

  // Make sure the database and tables exists
  useEffect(() => {
    db_.exec(`
			CREATE TABLE IF NOT EXISTS tasks (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				title TEXT NOT NULL,
				content TEXT,
				status INTEGER DEFAULT 0,
				placement INTEGER DEFAULT 0
			);`
    )
  }, [])

  const tasks: Task[] = useMemo(() => {
    const query = db_.prepare("SELECT id, title, content, status, placement FROM tasks ORDER BY status, placement ASC");
    return query.all().map(record => {
      const task = record as Task
      return ({
        id: Number(task["id"]),
        title: String(task["title"]),
        content: String(task["content"]),
        status: Object.entries(TaskStatus).find((_, value) => value === Number(task["status"]))?.[0] as TaskStatusType,
        placement: Number(task["placement"])
      })
    }
    ) as Task[]
  }, [])

  const result: TasksResult = {
    tasks: {
      TODO: tasks?.filter(task => task.status === "TODO") ?? [],
      IN_PROGRESS: tasks?.filter(task => task.status === "IN_PROGRESS") ?? [],
      BLOCKED: tasks?.filter(task => task.status === "BLOCKED") ?? [],
      DONE: tasks?.filter(task => task.status === "DONE") ?? [],
    }
  }
  return result
}
