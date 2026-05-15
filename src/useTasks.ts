import { useEffect, useState } from "react"
import { db_ } from "./index.js"
import type { CliRenderer } from "@opentui/core";
import { tmpdir } from "node:os";

export enum TaskStatus {
  todo = 0,
  inProgress = 1,
  blocked = 2,
  done = 3
}

export type Error = {
  code: string;
};

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
  editTask: (task: Task) => void
  createTask: (title: string, status: TaskStatus, placement: number) => void
  deleteTask: (task: Task) => void
}

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

export const useTasks = (renderer: CliRenderer) => {
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

  const editTask = async (task: Task) => {
    const editor = process.env["EDITOR"] ?? "nvim";
    renderer.suspend();
    const filePath = `${tmpdir()}/task-${task.id}.md`;
    const editedTaskFile = Bun.file(filePath)
    await editedTaskFile.write(task.content)
    Bun.spawn([editor, filePath], {
      stdio: ["inherit", "inherit", "inherit"],
      onExit: async () => {
        renderer.resume();
        try {
          const editedTaskContent = await editedTaskFile.text();
          db_.query(`
            UPDATE tasks SET 
              content = $content
            WHERE id = $id;
          `).run({ $id: task.id, $content: editedTaskContent })
          await editedTaskFile.delete()
          setTasks(getTasks)
        } catch (e) {
          // Check if not exists error, i.e. user did not save file
          if ((e as Error).code !== "ENOENT") {
            throw e;
          }
        }
      },
    });
  };

  const createTask = (title: string, status: TaskStatus, placement: number) => {
    db_.transaction(() => {
      db_.query(`
        UPDATE tasks SET 
          placement = placement + 1
        WHERE status = $status and placement >= $placement;
        `).run({ $status: status, $placement: placement })
      db_.query(`
          INSERT INTO tasks (title, content, status, placement)
          VALUES ($title, "", $status, $placement)
          `).run({ $title: title, $status: status, $placement: placement })
    })()
    setTasks(getTasks)
  }

  const deleteTask = (task: Task) => {
    db_.query(`
      DELETE FROM tasks
      WHERE id = $id
      `).run({ $id: task.id })
    db_.query(`
      UPDATE tasks SET 
        placement = placement - 1
      WHERE status = $status and placement >= $placement;
      `).run({ $status: task.status, $placement: task.placement })
    setTasks(getTasks)
  }

  const result: TasksResult = {
    tasks: {
      todo: tasks?.filter(task => task.status === TaskStatus.todo) ?? [],
      inProgress: tasks?.filter(task => task.status === TaskStatus.inProgress) ?? [],
      blocked: tasks?.filter(task => task.status === TaskStatus.blocked) ?? [],
      done: tasks?.filter(task => task.status === TaskStatus.done) ?? [],
    },
    changeTaskStatus: changeTaskStatus,
    swapTasks: swapTasks,
    editTask: editTask,
    createTask: createTask,
    deleteTask: deleteTask
  }
  return result
}
