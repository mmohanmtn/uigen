import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge, getToolLabel } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// getToolLabel – str_replace_editor
// ---------------------------------------------------------------------------

test("getToolLabel: str_replace_editor create with path", () => {
  expect(
    getToolLabel("str_replace_editor", {
      command: "create",
      path: "/src/components/Button.tsx",
    })
  ).toBe("Creating Button.tsx");
});

test("getToolLabel: str_replace_editor create without path", () => {
  expect(getToolLabel("str_replace_editor", { command: "create" })).toBe(
    "Creating file"
  );
});

test("getToolLabel: str_replace_editor str_replace with path", () => {
  expect(
    getToolLabel("str_replace_editor", {
      command: "str_replace",
      path: "/src/App.tsx",
    })
  ).toBe("Editing App.tsx");
});

test("getToolLabel: str_replace_editor insert with path", () => {
  expect(
    getToolLabel("str_replace_editor", {
      command: "insert",
      path: "/src/App.tsx",
    })
  ).toBe("Editing App.tsx");
});

test("getToolLabel: str_replace_editor view with path", () => {
  expect(
    getToolLabel("str_replace_editor", {
      command: "view",
      path: "/src/index.ts",
    })
  ).toBe("Reading index.ts");
});

test("getToolLabel: str_replace_editor undo_edit with path", () => {
  expect(
    getToolLabel("str_replace_editor", {
      command: "undo_edit",
      path: "/src/main.tsx",
    })
  ).toBe("Reverting main.tsx");
});

test("getToolLabel: str_replace_editor unknown command falls back to editing label", () => {
  expect(
    getToolLabel("str_replace_editor", {
      command: "unknown_cmd",
      path: "/src/file.ts",
    })
  ).toBe("Editing file.ts");
});

test("getToolLabel: str_replace_editor empty args falls back gracefully", () => {
  expect(getToolLabel("str_replace_editor", {})).toBe("Editing file");
});

test("getToolLabel: str_replace_editor null args falls back gracefully", () => {
  expect(getToolLabel("str_replace_editor", null)).toBe("Editing file");
});

test("getToolLabel: str_replace_editor extracts filename from deeply nested path", () => {
  expect(
    getToolLabel("str_replace_editor", {
      command: "create",
      path: "/a/b/c/d/Component.tsx",
    })
  ).toBe("Creating Component.tsx");
});

// ---------------------------------------------------------------------------
// getToolLabel – file_manager
// ---------------------------------------------------------------------------

test("getToolLabel: file_manager rename with both paths", () => {
  expect(
    getToolLabel("file_manager", {
      command: "rename",
      path: "/src/Old.tsx",
      new_path: "/src/New.tsx",
    })
  ).toBe("Renaming Old.tsx → New.tsx");
});

test("getToolLabel: file_manager rename missing new_path falls back", () => {
  expect(
    getToolLabel("file_manager", { command: "rename", path: "/src/Old.tsx" })
  ).toBe("Renaming file");
});

test("getToolLabel: file_manager rename missing both paths falls back", () => {
  expect(getToolLabel("file_manager", { command: "rename" })).toBe(
    "Renaming file"
  );
});

test("getToolLabel: file_manager delete with path", () => {
  expect(
    getToolLabel("file_manager", {
      command: "delete",
      path: "/src/Remove.tsx",
    })
  ).toBe("Deleting Remove.tsx");
});

test("getToolLabel: file_manager delete without path falls back", () => {
  expect(getToolLabel("file_manager", { command: "delete" })).toBe(
    "Deleting file"
  );
});

test("getToolLabel: file_manager empty args falls back to managing files", () => {
  expect(getToolLabel("file_manager", {})).toBe("Managing files");
});

// ---------------------------------------------------------------------------
// getToolLabel – unknown tool
// ---------------------------------------------------------------------------

test("getToolLabel: unknown tool returns the tool name as-is", () => {
  expect(getToolLabel("some_other_tool", {})).toBe("some_other_tool");
});

// ---------------------------------------------------------------------------
// ToolInvocationBadge – rendering
// ---------------------------------------------------------------------------

test("ToolInvocationBadge shows friendly label in loading (call) state", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "call",
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/src/Button.tsx" },
      }}
    />
  );
  expect(screen.getByText("Creating Button.tsx")).toBeDefined();
});

test("ToolInvocationBadge shows friendly label in result state", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "result",
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "str_replace", path: "/src/App.tsx" },
        result: "Success",
      }}
    />
  );
  expect(screen.getByText("Editing App.tsx")).toBeDefined();
});

test("ToolInvocationBadge shows spinner when state is call", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "call",
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/src/Button.tsx" },
      }}
    />
  );
  expect(container.querySelector(".animate-spin")).not.toBeNull();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolInvocationBadge shows spinner when state is partial-call", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "partial-call",
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: {},
      }}
    />
  );
  expect(container.querySelector(".animate-spin")).not.toBeNull();
});

test("ToolInvocationBadge shows green dot when state is result with a result value", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "result",
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: { command: "create", path: "/src/Button.tsx" },
        result: "OK",
      }}
    />
  );
  expect(container.querySelector(".bg-emerald-500")).not.toBeNull();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("ToolInvocationBadge keeps spinner when state is result but result is null", () => {
  const { container } = render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "result",
        toolCallId: "1",
        toolName: "str_replace_editor",
        args: {},
        result: null,
      }}
    />
  );
  expect(container.querySelector(".animate-spin")).not.toBeNull();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("ToolInvocationBadge shows delete label for file_manager", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "call",
        toolCallId: "2",
        toolName: "file_manager",
        args: { command: "delete", path: "/src/OldComponent.tsx" },
      }}
    />
  );
  expect(screen.getByText("Deleting OldComponent.tsx")).toBeDefined();
});

test("ToolInvocationBadge shows rename label for file_manager", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "result",
        toolCallId: "3",
        toolName: "file_manager",
        args: {
          command: "rename",
          path: "/src/Old.tsx",
          new_path: "/src/New.tsx",
        },
        result: { success: true },
      }}
    />
  );
  expect(screen.getByText("Renaming Old.tsx → New.tsx")).toBeDefined();
});

test("ToolInvocationBadge falls back to tool name for unknown tools", () => {
  render(
    <ToolInvocationBadge
      toolInvocation={{
        state: "call",
        toolCallId: "4",
        toolName: "web_search",
        args: {},
      }}
    />
  );
  expect(screen.getByText("web_search")).toBeDefined();
});
