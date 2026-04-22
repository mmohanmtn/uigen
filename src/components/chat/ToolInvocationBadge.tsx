"use client";

import { Loader2 } from "lucide-react";

export interface ToolInvocationData {
  state: "call" | "partial-call" | "result";
  toolCallId: string;
  toolName: string;
  args: unknown;
  result?: unknown;
}

function getFileName(path: string): string {
  return path.split("/").filter(Boolean).pop() || path;
}

export function getToolLabel(toolName: string, args: unknown): string {
  const a = (args ?? {}) as Record<string, unknown>;

  if (toolName === "str_replace_editor") {
    const command = a.command as string | undefined;
    const path = a.path as string | undefined;
    const filename = path ? getFileName(path) : null;

    switch (command) {
      case "create":
        return filename ? `Creating ${filename}` : "Creating file";
      case "str_replace":
      case "insert":
        return filename ? `Editing ${filename}` : "Editing file";
      case "view":
        return filename ? `Reading ${filename}` : "Reading file";
      case "undo_edit":
        return filename ? `Reverting ${filename}` : "Reverting file";
      default:
        return filename ? `Editing ${filename}` : "Editing file";
    }
  }

  if (toolName === "file_manager") {
    const command = a.command as string | undefined;
    const path = a.path as string | undefined;
    const newPath = a.new_path as string | undefined;
    const filename = path ? getFileName(path) : null;

    switch (command) {
      case "rename": {
        const newFilename = newPath ? getFileName(newPath) : null;
        return filename && newFilename
          ? `Renaming ${filename} → ${newFilename}`
          : "Renaming file";
      }
      case "delete":
        return filename ? `Deleting ${filename}` : "Deleting file";
      default:
        return "Managing files";
    }
  }

  return toolName;
}

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocationData;
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const { state, toolName, args } = toolInvocation;
  const isDone = state === "result" && toolInvocation.result != null;
  const label = getToolLabel(toolName, args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
