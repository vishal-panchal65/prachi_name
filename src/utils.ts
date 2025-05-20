// src/utils.ts
import { config } from "./config"

// Generate a random number between min and max (inclusive)
export function getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

// Get a random number of commits for today (between min and max)
export function getRandomCommitCount(): number {
    return getRandomInt(config.minCommitsPerDay, config.maxCommitsPerDay)
}

// Format date as YYYY-MM-DD
export function formatDate(date: Date): string {
    return date.toISOString().split("T")[0]
}

// Generate commit messages
export const commitMessages = [
    "Update documentation",
    "Fix typo",
    "Add new feature",
    "Refactor code",
    "Improve performance",
    "Update dependencies",
    "Fix bug",
    "Add tests",
    "Minor changes",
    "Update readme",
    "Code cleanup",
    "Optimize code",
    "Fix issue",
    "Update configuration",
    "Improve error handling"
]

// Get random commit message
export function getRandomCommitMessage(): string {
    const index = getRandomInt(0, commitMessages.length - 1)
    return commitMessages[index]
}

// Generate a random content update
export function generateRandomContent(): string {
    const timestamp = new Date().toISOString()
    const randomNumber = Math.floor(Math.random() * 1000)
    return `Last updated at ${timestamp}\nRandom value: ${randomNumber}\n`
}

// Get the next day's date
export function getNextDay(date: Date): Date {
    const nextDate = new Date(date)
    nextDate.setDate(nextDate.getDate() + 1)
    return nextDate
}

// Check if two dates are the same day
export function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    )
}

// Get days between two dates (inclusive)
export function getDaysBetweenDates(startDate: Date, endDate: Date): number {
    // Clone the dates to avoid modifying the originals
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Reset time to 00:00:00 to ensure we're only counting days
    start.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)

    // Calculate difference in days
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    // Add 1 to include both start and end dates
    return diffDays + 1
}
