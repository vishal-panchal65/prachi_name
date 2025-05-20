// src/file.ts
import fs from "fs/promises"
import path from "path"
import { generateRandomContent } from "./utils"
import { config } from "./config"

// Ensure target file exists
export async function ensureFileExists(): Promise<void> {
    try {
        await fs.access(config.targetFile)
    } catch (error) {
        // File doesn't exist, create directory if needed
        const dirPath = path.dirname(config.targetFile)
        await fs.mkdir(dirPath, { recursive: true })

        // Create the file with initial content
        await fs.writeFile(
            config.targetFile,
            `# Auto Commit File\nCreated at ${new Date().toISOString()}\n`,
            "utf-8"
        )
    }
}

// Update the target file with random content
export async function updateFile(): Promise<void> {
    try {
        // First ensure the file exists
        await ensureFileExists()

        // Read current content
        const currentContent = await fs.readFile(config.targetFile, "utf-8")

        // Generate new content and append it
        const newContent = generateRandomContent()
        await fs.writeFile(
            config.targetFile,
            `${currentContent}\n${newContent}`,
            "utf-8"
        )
    } catch (error) {
        console.error("Error updating file:", error)
        throw error
    }
}
