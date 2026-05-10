import { useEffect, useState } from "react"
import { db_ } from "./index.js"

export enum TaskStatus {
  todo = 0,
  inProgress = 1,
  blocked = 2,
  done = 3
}

export type Task = {
  id: number
  title: string
  content: string
  status: TaskStatus
  placement: number
}

export type TasksResult = {
  tasks: { [key in (keyof typeof TaskStatus)]: Task[] }
  changeTaskStatus: (task: Task, newStatus: TaskStatus) => void
  swapTasks: (a: Task, b: Task) => void
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
//

const getTasks = () => {
  const query = db_.prepare("SELECT id, title, content, status, placement FROM tasks ORDER BY status, placement ASC");
  return query.all().map(record => {
    const task = record as Task
    return ({
      id: Number(task["id"]),
      title: String(task["title"]),
      content: String(task["content"]),
      status: task["status"] as TaskStatus,
      placement: Number(task["placement"])
    })
  }) as Task[]
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([])

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
    setTasks(getTasks())
  }, [])

  const swapTasks = (a: Task, b: Task) => {
    const updatePlacement = db_.query(`
      UPDATE tasks SET 
        placement = $placement
      WHERE id = $id;
    `)
    db_.transaction(() => {
      updatePlacement.run({ $id: a.id, $placement: b.placement })
      updatePlacement.run({ $id: b.id, $placement: a.placement })
    })()
    setTasks(getTasks())
  }

  const changeTaskStatus = (task: Task, newStatus: TaskStatus) => {
    db_.transaction(() => {
      db_.query(`
        UPDATE tasks SET 
          status = $status,
          placement = $placement
        WHERE id = $id;
        `).run({ $status: newStatus, $placement: 0, $id: task.id })
      db_.query(`
        UPDATE tasks SET 
          placement = placement + 1
        WHERE status = $status;
      `).run({ $status: newStatus })
    })()
    setTasks(getTasks())
  }

  const result: TasksResult = {
    tasks: {
      todo: tasks?.filter(task => task.status === TaskStatus.todo) ?? [],
      inProgress: tasks?.filter(task => task.status === TaskStatus.inProgress) ?? [],
      blocked: tasks?.filter(task => task.status === TaskStatus.blocked) ?? [],
      done: tasks?.filter(task => task.status === TaskStatus.done) ?? [],
    },
    changeTaskStatus: changeTaskStatus,
    swapTasks: swapTasks
  }
  return result
}
