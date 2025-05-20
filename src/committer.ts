// src/committer.ts
import { updateFile } from "./files"
import { makeCommit } from "./git"
import {
    getRandomInt,
    getRandomCommitCount,
    formatDate,
    getNextDay,
    isSameDay
} from "./utils"
import { config } from "./config"

// Generate a sequential array of timestamps for a given day
// (ensuring they're in ascending order throughout the day)
function generateTimestampsForDay(date: Date, count: number): Date[] {
    // Reset time to start of day
    const baseDate = new Date(date)
    baseDate.setHours(0, 0, 0, 0)

    // Business hours: 9 AM to 6 PM (in seconds: 9*3600 to 18*3600)
    const startOfDay = 9 * 3600 // 9 AM in seconds
    const endOfDay = 18 * 3600 // 6 PM in seconds
    const dayRange = endOfDay - startOfDay

    // Generate random seconds within the day but ensure they're in order
    const secondsInDay: number[] = []

    // Generate 'count' random times (in seconds since start of day)
    for (let i = 0; i < count; i++) {
        secondsInDay.push(getRandomInt(startOfDay, endOfDay))
    }

    // Sort in ascending order to ensure realistic time progression
    secondsInDay.sort((a, b) => a - b)

    // Convert seconds to Date objects
    return secondsInDay.map((seconds) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60

        const timestamp = new Date(baseDate)
        timestamp.setHours(hours, minutes, secs)
        return timestamp
    })
}

// Process all commits for the date range
export async function processDateRange(): Promise<void> {
    // Clone the dates to avoid modifying the originals
    let currentDate = new Date(config.startDate)
    const endDate = new Date(config.endDate)

    // Reset time components to ensure proper day comparison
    currentDate.setHours(0, 0, 0, 0)
    endDate.setHours(0, 0, 0, 0)

    console.log(
        `Starting commits from ${formatDate(currentDate)} to ${formatDate(
            endDate
        )}`
    )

    // Process each day in the range
    while (currentDate <= endDate) {
        await processDay(currentDate)

        // Move to the next day
        currentDate = getNextDay(currentDate)
    }

    console.log("All commits completed successfully")
}

// Process commits for a single day
async function processDay(date: Date): Promise<void> {
    // Get random number of commits for this day
    const commitCount = getRandomCommitCount()
    console.log(`Processing ${commitCount} commits for ${formatDate(date)}`)

    // Generate timestamps for all commits in this day
    const commitTimestamps = generateTimestampsForDay(date, commitCount)

    // Make each commit
    for (let i = 0; i < commitCount; i++) {
        const commitTime = commitTimestamps[i]
        console.log(
            `Creating commit ${
                i + 1
            }/${commitCount} at ${commitTime.toISOString()}`
        )

        try {
            // Update file content
            await updateFile()

            // Commit and push changes
            await makeCommit(commitTime)

            // Small delay to avoid Git conflicts and rate limits
            await new Promise((resolve) => setTimeout(resolve, 1000))
        } catch (error) {
            console.error(
                `Error processing commit ${i + 1} for ${formatDate(date)}:`,
                error
            )
            // Continue with the next commit instead of breaking the entire process
        }
    }

    console.log(`Completed all commits for ${formatDate(date)}`)
}
