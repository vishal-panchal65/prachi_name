// // src/scheduler.ts
// import cron from "node-cron"
// import {
//     getRandomCommitCount,
//     getNextDay,
//     formatDate,
//     getRandomInt
// } from "./utils"
// import { updateFile } from "./files"
// import { makeCommit } from "./git"
// import { config } from "./config"

// let currentDate: Date

// // Initialize the current date to either the provided start date or today
// export function initializeDate(): void {
//     currentDate = config.startDate ? new Date(config.startDate) : new Date()
// }

// // Generate a random time for the commit within a day
// function getRandomTimeForDate(date: Date): Date {
//     const result = new Date(date)
//     // Random hour between 9 AM and 8 PM (work hours)
//     result.setHours(getRandomInt(9, 20))
//     // Random minute
//     result.setMinutes(getRandomInt(0, 59))
//     // Random second
//     result.setSeconds(getRandomInt(0, 59))
//     return result
// }

// // Process commits for current date
// export async function processCommitsForDate(): Promise<void> {
//     const commitCount = getRandomCommitCount()
//     console.log(
//         `Processing ${commitCount} commits for ${formatDate(currentDate)}`
//     )

//     for (let i = 0; i < commitCount; i++) {
//         // Generate a random time for this commit
//         const commitDateTime = getRandomTimeForDate(currentDate)
//         console.log(
//             `Creating commit with date: ${commitDateTime.toISOString()}`
//         )

//         await updateFile()
//         await makeCommit(commitDateTime)

//         // In immediate mode, just add a small delay to avoid overwhelming Git
//         await new Promise((resolve) => setTimeout(resolve, 1000))
//     }

//     // Move to the next day
//     currentDate = getNextDay(currentDate)
// }

// // Process commits for multiple days at once
// export async function processMultipleDays(
//     numberOfDays: number = 1
// ): Promise<void> {
//     initializeDate()
//     console.log(
//         `Starting batch processing for ${numberOfDays} days from ${formatDate(
//             currentDate
//         )}`
//     )

//     for (let day = 0; day < numberOfDays; day++) {
//         await processCommitsForDate()
//         // currentDate is already incremented in processCommitsForDate
//     }

//     console.log("Batch processing completed")
// }

// // Start the scheduler
// export function startScheduler(): void {
//     initializeDate()

//     // Run daily at a random hour (to avoid patterns)
//     // This example runs every day at 3:30 AM
//     cron.schedule(
//         "30 3 * * *",
//         async () => {
//             await processCommitsForDate()
//         },
//         {
//             timezone: config.timeZone
//         }
//     )

//     console.log(
//         "Scheduler started. Will run daily at 3:30 AM in the configured timezone."
//     )
// }

// src/pattern-scheduler.ts
import { PRACHI } from "./pixel-map"

// Constants for date calculations
const DAYS_IN_WEEK = 7
const STARTING_DATE = new Date("2024-05-19") // Sunday

/**
 * Generate schedule of dates to commit based on the PRACHI pattern
 * @returns A map of date strings to commit counts (0 for no commits, >0 for commits)
 */
export function generateCommitSchedule(): Map<string, number> {
    const commitSchedule = new Map<string, number>()

    // Week starts with Sunday (0) in JavaScript Date
    // GitHub contribution graph starts with Sunday (column 0) at the top

    // Iterate through each column in the pattern (which represents weeks)
    for (let col = 0; col < PRACHI[0].length; col++) {
        for (let row = 0; row < DAYS_IN_WEEK; row++) {
            // Calculate the date for this cell
            const dayOffset = col * DAYS_IN_WEEK + row
            const commitDate = new Date(STARTING_DATE)
            commitDate.setDate(STARTING_DATE.getDate() + dayOffset)

            // Skip dates beyond May 20, 2025
            const endDate = new Date("2025-05-20")
            if (commitDate > endDate) {
                continue
            }

            // Get the pattern value for this cell (0 or 1)
            const shouldCommit = PRACHI[row][col]

            // Format date as YYYY-MM-DD
            const dateString = commitDate.toISOString().split("T")[0]

            if (shouldCommit) {
                // Decide number of commits for this day (3-7 for visibility)
                commitSchedule.set(
                    dateString,
                    Math.floor(Math.random() * 5) + 3
                )
            } else {
                // No commits for this day
                commitSchedule.set(dateString, 0)
            }
        }
    }

    return commitSchedule
}

/**
 * Check if a date should have commits based on the schedule
 * @param date The date to check
 * @param schedule The commit schedule map
 * @returns Number of commits to make on this day (0 for no commits)
 */
export function getCommitsForDate(
    date: Date,
    schedule: Map<string, number>
): number {
    const dateString = date.toISOString().split("T")[0]
    return schedule.get(dateString) || 0
}

/**
 * Validate if the pattern fits within the date range
 * @returns Boolean indicating whether pattern fits
 */
export function validatePatternFits(): boolean {
    const totalDays = PRACHI[0].length * DAYS_IN_WEEK
    const startDate = new Date("2024-05-19")
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + totalDays - 1)

    const maxDate = new Date("2025-05-20")

    if (endDate > maxDate) {
        console.error(
            `Pattern needs ${totalDays} days but only ${Math.floor(
                (maxDate.getTime() - startDate.getTime()) /
                    (1000 * 60 * 60 * 24)
            )} days available`
        )
        return false
    }

    return true
}
