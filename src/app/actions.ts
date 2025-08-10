"use server";

import { suggestTaskTags } from "@/ai/flows/suggest-task-tags";

export async function suggestTaskTagsAction(taskDescription: string) {
  try {
    if (!taskDescription.trim()) {
      return [];
    }
    const result = await suggestTaskTags({ taskDescription });
    return result.tags;
  } catch (error) {
    console.error("Error suggesting tags:", error);
    return [];
  }
}
