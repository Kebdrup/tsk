import { create } from "zustand"
import { CliRenderer } from "@opentui/core";
import { tmpdir } from "node:os";
import { CREATE_DATABASE_SQL, CREATE_TASK_SQL, db_, DECREMENT_TASK_PLACEMENT_SQL, DELETE_TASK_SQL, INCREMENT_TASK_PLACEMENT_SQL, SELECT_TASKS_SQL, UPDATE_TASK_CONTENT_SQL, UPDATE_TASK_PLACEMENT_SQL, UPDATE_TASK_STATUS_PLACEMENT_SQL } from "../database";


export interface TaskStore {
  renderer: CliRenderer | null,
  initialize: (renderer: CliRenderer) => void
  tasks: { [key in (keyof typeof TaskStatus)]: Task[] }
  changeTaskStatus: (task: Task, newStatus: TaskStatus) => void
  swapTasks: (a: Task, b: Task) => void
  editTask: (task: Task) => void
  createTask: (title: string, status: TaskStatus, placement: number) => void
  deleteTask: (task: Task) => void
}


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

const tasksByStatus = (tasks: Task[]) => {
  return {
    todo: tasks?.filter(task => task.status === TaskStatus.todo) ?? [],
    inProgress: tasks?.filter(task => task.status === TaskStatus.inProgress) ?? [],
    blocked: tasks?.filter(task => task.status === TaskStatus.blocked) ?? [],
    done: tasks?.filter(task => task.status === TaskStatus.done) ?? [],
  }
}

export const useTaskStore = create<TaskStore>()((set, get) => ({
  renderer: null,
  initialize: (renderer: CliRenderer) => {
    db_.query(CREATE_DATABASE_SQL).run()
    set(() => ({ renderer }))
  },
  tasks: (() =>
    tasksByStatus(getTasks())
  )(),
  changeTaskStatus: (task: Task, newStatus: TaskStatus) => {
    db_.transaction(() => {
      db_.query(UPDATE_TASK_PLACEMENT_SQL).
        run({ $status: newStatus })
      db_.query(UPDATE_TASK_STATUS_PLACEMENT_SQL).
        run({ $status: newStatus, $placement: 0, $id: task.id })
    })()
    set(() => ({ tasks: tasksByStatus(getTasks()) }))
  },
  swapTasks: (a: Task, b: Task) => {
    const updatePlacement = db_.query(UPDATE_TASK_PLACEMENT_SQL)
    db_.transaction(() => {
      updatePlacement.run({ $id: a.id, $placement: b.placement })
      updatePlacement.run({ $id: b.id, $placement: a.placement })
    })()
    set(() => ({ tasks: tasksByStatus(getTasks()) }))
  },
  editTask: async (task: Task) => {
    const renderer = get().renderer
    if (renderer === null) {
      throw new Error("No renderer has been set")
    }
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
          set(() => ({ tasks: tasksByStatus(getTasks()) }))
        } catch (e) {
          // Check if not exists error, i.e. user did not save file
          if ((e as Error).code !== "ENOENT") {
            throw e;
          }
        }
      },
    });
  },
  createTask: (title: string, status: TaskStatus, placement: number) => {
    db_.transaction(() => {
      db_.query(INCREMENT_TASK_PLACEMENT_SQL).
        run({ $status: status, $placement: placement })
      db_.query(CREATE_TASK_SQL).
        run({ $title: title, $status: status, $placement: placement })
    })()
    set(() => ({ tasks: tasksByStatus(getTasks()) }))
  },
  deleteTask: (task: Task) => {
    db_.query(DELETE_TASK_SQL).run({ $id: task.id })
    db_.query(DECREMENT_TASK_PLACEMENT_SQL).
      run({ $status: task.status, $placement: task.placement })
    set(() => ({ tasks: tasksByStatus(getTasks()) }))
  }


}))

