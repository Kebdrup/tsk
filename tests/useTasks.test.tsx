import { beforeAll, describe, mock, it, expect, beforeEach } from "bun:test";
import { Database } from "bun:sqlite";
import { TaskStatus, useTasks } from "../src/useTasks";
import { CliRenderer } from "@opentui/core";
import { createTestRenderer } from "@opentui/core/testing";
import { testRender } from "@opentui/react/test-utils";
import { act } from "react";

describe("useTasks", () => {
  let renderer: Awaited<ReturnType<typeof createTestRenderer>>["renderer"];
  let testSetup: Awaited<ReturnType<typeof testRender>>;
  let useTasksResult: ReturnType<typeof useTasks>;

  // Component for testing the hook output and functions
  const HookCapture = ({ renderer }: { renderer: CliRenderer }) => {
    useTasksResult = useTasks(renderer);
    return <text>Placeholder</text>;
  };

  beforeAll(async () => {
    const result = await createTestRenderer({
      width: 120,
      height: 50,
    });

    renderer = result.renderer;
  });

  beforeEach(async () => {
    mock.module("../src/database", () => ({
      db_: new Database(":memory:"),
    }));
    testSetup = await testRender(<HookCapture renderer={renderer} />, {});
    await testSetup.renderOnce();
  });

  it("Can create tasks", async () => {
    // Create first task
    act(() => {
      useTasksResult.createTask("Test Task", TaskStatus.todo, 0);
    });
    expect(useTasksResult.tasks.todo).toHaveLength(1);
    expect(useTasksResult.tasks.todo[0]).toHaveProperty("title", "Test Task");
    expect(useTasksResult.tasks.todo[0]).toHaveProperty("placement", 0);

    // Create second task
    act(() => {
      useTasksResult.createTask("Test Task 2", TaskStatus.todo, 0);
    });
    expect(useTasksResult.tasks.todo).toHaveLength(2);
    expect(useTasksResult.tasks.todo[0]).toHaveProperty("title", "Test Task 2");
    expect(useTasksResult.tasks.todo[0]).toHaveProperty("placement", 0);
    expect(useTasksResult.tasks.todo[1]).toHaveProperty("title", "Test Task");
    expect(useTasksResult.tasks.todo[1]).toHaveProperty("placement", 1);

    // Create task with another status
    act(() => {
      useTasksResult.createTask("Test Task 3", TaskStatus.inProgress, 0);
    });
    expect(useTasksResult.tasks.todo).toHaveLength(2);
    expect(useTasksResult.tasks.inProgress).toHaveLength(1);
    expect(useTasksResult.tasks.inProgress[0]).toHaveProperty(
      "title",
      "Test Task 3",
    );
    expect(useTasksResult.tasks.inProgress[0]).toHaveProperty("placement", 0);
  });

  it("Can swap tasks", async () => {
    // Create first task
    act(() => {
      useTasksResult.createTask("Test Task", TaskStatus.todo, 0);
    });
    expect(useTasksResult.tasks.todo).toHaveLength(1);
    expect(useTasksResult.tasks.todo[0]).toHaveProperty("title", "Test Task");
    expect(useTasksResult.tasks.todo[0]).toHaveProperty("placement", 0);

    // Create second task
    act(() => {
      useTasksResult.createTask("Test Task 2", TaskStatus.todo, 0);
    });
    expect(useTasksResult.tasks.todo).toHaveLength(2);
    expect(useTasksResult.tasks.todo[0]).toHaveProperty("title", "Test Task 2");
    expect(useTasksResult.tasks.todo[0]).toHaveProperty("placement", 0);
    expect(useTasksResult.tasks.todo[1]).toHaveProperty("title", "Test Task");
    expect(useTasksResult.tasks.todo[1]).toHaveProperty("placement", 1);

    // Swap tasks
    act(() => {
      useTasksResult.swapTasks(
        useTasksResult.tasks.todo[0]!,
        useTasksResult.tasks.todo[1]!,
      );
    });
    expect(useTasksResult.tasks.todo[0]).toHaveProperty("title", "Test Task");
    expect(useTasksResult.tasks.todo[0]).toHaveProperty("placement", 0);
    expect(useTasksResult.tasks.todo[1]).toHaveProperty("title", "Test Task 2");
    expect(useTasksResult.tasks.todo[1]).toHaveProperty("placement", 1);
  });

  it("Can change tasks status", async () => {
    // Create first task
    act(() => {
      useTasksResult.createTask("Test Task", TaskStatus.todo, 0);
    });
    expect(useTasksResult.tasks.todo).toHaveLength(1);
    expect(useTasksResult.tasks.todo[0]).toHaveProperty("title", "Test Task");
    expect(useTasksResult.tasks.todo[0]).toHaveProperty("placement", 0);

    // Create second task
    act(() => {
      useTasksResult.createTask("Test Task 2", TaskStatus.inProgress, 0);
    });
    expect(useTasksResult.tasks.todo).toHaveLength(1);
    expect(useTasksResult.tasks.todo[0]).toHaveProperty("title", "Test Task");
    expect(useTasksResult.tasks.todo[0]).toHaveProperty("placement", 0);
    expect(useTasksResult.tasks.inProgress).toHaveLength(1);
    expect(useTasksResult.tasks.inProgress[0]).toHaveProperty(
      "title",
      "Test Task 2",
    );
    expect(useTasksResult.tasks.inProgress[0]).toHaveProperty("placement", 0);

    // Change status of the first task
    act(() => {
      useTasksResult.changeTaskStatus(
        useTasksResult.tasks.todo[0]!,
        TaskStatus.inProgress,
      );
    });
    expect(useTasksResult.tasks.todo).toHaveLength(0);
    expect(useTasksResult.tasks.inProgress).toHaveLength(2);
    expect(useTasksResult.tasks.inProgress[0]).toHaveProperty(
      "title",
      "Test Task",
    );
    expect(useTasksResult.tasks.inProgress[0]).toHaveProperty("placement", 0);
    expect(useTasksResult.tasks.inProgress[1]).toHaveProperty(
      "title",
      "Test Task 2",
    );
    expect(useTasksResult.tasks.inProgress[1]).toHaveProperty("placement", 1);
  });

  it("Can delete tasks", async () => {
    // Create first task
    act(() => {
      useTasksResult.createTask("Test Task", TaskStatus.todo, 0);
    });
    expect(useTasksResult.tasks.todo).toHaveLength(1);

    // Create second task
    act(() => {
      useTasksResult.createTask("Test Task 2", TaskStatus.todo, 1);
    });
    expect(useTasksResult.tasks.todo).toHaveLength(2);

    // Delete the first task
    act(() => {
      useTasksResult.deleteTask(useTasksResult.tasks.todo[0]!);
    });
    expect(useTasksResult.tasks.todo).toHaveLength(1);
    expect(useTasksResult.tasks.todo[0]).toHaveProperty("title", "Test Task 2");
    expect(useTasksResult.tasks.todo[0]).toHaveProperty("placement", 0);
  });
});
