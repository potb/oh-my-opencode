import { existsSync, unlinkSync } from "node:fs"
import { getBoulderFilePath } from "./storage"

export function clearBoulderState(directory: string): boolean {
  const filePath = getBoulderFilePath(directory)

  try {
    if (existsSync(filePath)) {
      unlinkSync(filePath)
    }
    return true
  } catch {
    return false
  }
}
