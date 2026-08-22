import { useEffect, useState } from "react"
import type { CliRenderer } from "@opentui/core";
import { tmpdir } from "node:os";
import { CREATE_DATABASE_SQL, CREATE_TASK_SQL, db_, DECREMENT_TASK_PLACEMENT_SQL, DELETE_TASK_SQL, INCREMENT_TASK_PLACEMENT_SQL, SELECT_TASKS_SQL, UPDATE_TASK_CONTENT_SQL, UPDATE_TASK_PLACEMENT_SQL, UPDATE_TASK_STATUS_PLACEMENT_SQL } from "./database";

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
  const query = db_.prepare(SELECT_TASKS_SQL);
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
    db_.query(CREATE_DATABASE_SQL).run()
    setTasks(getTasks())
  }, [])

  const swapTasks = (a: Task, b: Task) => {
    const updatePlacement = db_.query(UPDATE_TASK_PLACEMENT_SQL)
    db_.transaction(() => {
      updatePlacement.run({ $id: a.id, $placement: b.placement })
      updatePlacement.run({ $id: b.id, $placement: a.placement })
    })()
    setTasks(getTasks())
  }

  const changeTaskStatus = (task: Task, newStatus: TaskStatus) => {
    db_.transaction(() => {
      db_.query(UPDATE_TASK_PLACEMENT_SQL).
        run({ $status: newStatus })
      db_.query(UPDATE_TASK_STATUS_PLACEMENT_SQL).
        run({ $status: newStatus, $placement: 0, $id: task.id })
    })()
    setTasks(getTasks())
  }

  const editTask = async (task: Task) => {
    const editor = process.env["EDITOR"] ?? "nvim";
    renderer.suspend();
    const filePath = `${tmpdir()}/task-${task.id}.md`;
    const editedTaskFile = Bun.file(filePath)
    await editedTaskFile.write(task.content)
    // Spawn the editor as a new subprocess
    // Resume current renderer on exit
    Bun.spawn([editor, filePath], {
      stdio: ["inherit", "inherit", "inherit"],
      onExit: async () => {
        renderer.resume();
        try {
          const editedTaskContent = await editedTaskFile.text();
          db_.query(UPDATE_TASK_CONTENT_SQL).
            run({ $id: task.id, $content: editedTaskContent })
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
      db_.query(INCREMENT_TASK_PLACEMENT_SQL).
        run({ $status: status, $placement: placement })
      db_.query(CREATE_TASK_SQL).
        run({ $title: title, $status: status, $placement: placement })
    })()
    setTasks(getTasks())
  }

  const deleteTask = (task: Task) => {
    db_.query(DELETE_TASK_SQL).run({ $id: task.id })
    db_.query(DECREMENT_TASK_PLACEMENT_SQL).
      run({ $status: task.status, $placement: task.placement })
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
    swapTasks: swapTasks,
    editTask: editTask,
    createTask: createTask,
    deleteTask: deleteTask
  }
  return result
}
