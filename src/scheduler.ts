// src/scheduler.ts
import cron from "node-cron"
import {
    getRandomCommitCount,
    getNextDay,
    formatDate,
    getRandomInt
} from "./utils"
import { updateFile } from "./files"
import { makeCommit } from "./git"
import { config } from "./config"

let currentDate: Date

// Initialize the current date to either the provided start date or today
export function initializeDate(): void {
    currentDate = config.startDate ? new Date(config.startDate) : new Date()
}

// Generate a random time for the commit within a day
function getRandomTimeForDate(date: Date): Date {
    const result = new Date(date)
    // Random hour between 9 AM and 8 PM (work hours)
    result.setHours(getRandomInt(9, 20))
    // Random minute
    result.setMinutes(getRandomInt(0, 59))
    // Random second
    result.setSeconds(getRandomInt(0, 59))
    return result
}

// Process commits for current date
export async function processCommitsForDate(): Promise<void> {
    const commitCount = getRandomCommitCount()
    console.log(
        `Processing ${commitCount} commits for ${formatDate(currentDate)}`
    )

    for (let i = 0; i < commitCount; i++) {
        // Generate a random time for this commit
        const commitDateTime = getRandomTimeForDate(currentDate)
        console.log(
            `Creating commit with date: ${commitDateTime.toISOString()}`
        )

        await updateFile()
        await makeCommit(commitDateTime)

        // In immediate mode, just add a small delay to avoid overwhelming Git
        await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    // Move to the next day
    currentDate = getNextDay(currentDate)
}

// Process commits for multiple days at once
export async function processMultipleDays(
    numberOfDays: number = 1
): Promise<void> {
    initializeDate()
    console.log(
        `Starting batch processing for ${numberOfDays} days from ${formatDate(
            currentDate
        )}`
    )

    for (let day = 0; day < numberOfDays; day++) {
        await processCommitsForDate()
        // currentDate is already incremented in processCommitsForDate
    }

    console.log("Batch processing completed")
}

// Start the scheduler
export function startScheduler(): void {
    initializeDate()

    // Run daily at a random hour (to avoid patterns)
    // This example runs every day at 3:30 AM
    cron.schedule(
        "30 3 * * *",
        async () => {
            await processCommitsForDate()
        },
        {
            timezone: config.timeZone
        }
    )

    console.log(
        "Scheduler started. Will run daily at 3:30 AM in the configured timezone."
    )
}
