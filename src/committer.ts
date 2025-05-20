// // src/committer.ts
// import { updateFile } from "./files"
// import { makeCommit, pushCommits } from "./git"
// import {
//     getRandomInt,
//     getRandomCommitCount,
//     formatDate,
//     getNextDay,
//     isSameDay
// } from "./utils"
// import { config } from "./config"

// // Maximum number of commits before pushing
// const MAX_COMMITS_BEFORE_PUSH = 75 // A random value between 50-100

// // Counter for tracking days with commits
// let consecutiveDaysWithCommits = 0

// // Counter for tracking total commits since last push
// let commitsSinceLastPush = 0

// // Generate a sequential array of timestamps for a given day
// function generateTimestampsForDay(date: Date, count: number): Date[] {
//     // Reset time to start of day
//     const baseDate = new Date(date)
//     baseDate.setHours(0, 0, 0, 0)

//     // Business hours: 9 AM to 6 PM (in seconds: 9*3600 to 18*3600)
//     const startOfDay = 9 * 3600 // 9 AM in seconds
//     const endOfDay = 18 * 3600 // 6 PM in seconds

//     // Generate random seconds within the day but ensure they're in order
//     const secondsInDay: number[] = []

//     // Generate 'count' random times (in seconds since start of day)
//     for (let i = 0; i < count; i++) {
//         secondsInDay.push(getRandomInt(startOfDay, endOfDay))
//     }

//     // Sort in ascending order to ensure realistic time progression
//     secondsInDay.sort((a, b) => a - b)

//     // Convert seconds to Date objects
//     return secondsInDay.map((seconds) => {
//         const hours = Math.floor(seconds / 3600)
//         const minutes = Math.floor((seconds % 3600) / 60)
//         const secs = seconds % 60

//         const timestamp = new Date(baseDate)
//         timestamp.setHours(hours, minutes, secs)
//         return timestamp
//     })
// }

// // Process all commits for the date range
// export async function processDateRange(): Promise<void> {
//     // Clone the dates to avoid modifying the originals
//     let currentDate = new Date(config.startDate)
//     const endDate = new Date(config.endDate)

//     // Reset time components to ensure proper day comparison
//     currentDate.setHours(0, 0, 0, 0)
//     endDate.setHours(0, 0, 0, 0)

//     console.log(
//         `Starting commits from ${formatDate(currentDate)} to ${formatDate(
//             endDate
//         )}`
//     )

//     // Process each day in the range
//     while (currentDate <= endDate) {
//         // Check if we should take a break (after 3-7 consecutive days with commits)
//         if (shouldTakeBreak()) {
//             const breakDays = getRandomInt(1, 2) // 1-2 days break
//             console.log(`Taking a ${breakDays} day break from commits...`)

//             // If we have pending commits, push them before the break
//             if (commitsSinceLastPush > 0) {
//                 await pushCommits()
//                 commitsSinceLastPush = 0
//             }

//             // Add the break days to current date
//             for (let i = 0; i < breakDays; i++) {
//                 currentDate = getNextDay(currentDate)
//                 if (currentDate > endDate) break
//             }

//             // Reset consecutive days counter
//             consecutiveDaysWithCommits = 0

//             // If we've gone past the end date due to the break, exit
//             if (currentDate > endDate) break
//         }

//         // Process this day
//         await processDay(currentDate)
//         consecutiveDaysWithCommits++

//         // Check if we need to push commits
//         if (commitsSinceLastPush >= MAX_COMMITS_BEFORE_PUSH) {
//             console.log(
//                 `Reached ${commitsSinceLastPush} commits, pushing to remote...`
//             )
//             await pushCommits()
//             commitsSinceLastPush = 0

//             // Add a delay after pushing to avoid rate limiting
//             const pushDelay = getRandomInt(5000, 15000) // 5-15 seconds
//             console.log(`Waiting ${pushDelay / 1000} seconds after push...`)
//             await new Promise((resolve) => setTimeout(resolve, pushDelay))
//         }

//         // Move to the next day
//         currentDate = getNextDay(currentDate)
//     }

//     // Push any remaining commits
//     if (commitsSinceLastPush > 0) {
//         console.log(`Pushing ${commitsSinceLastPush} remaining commits...`)
//         await pushCommits()
//     }

//     console.log("All commits completed successfully")
// }

// // Determine if we should take a break from committing
// function shouldTakeBreak(): boolean {
//     // Take a break after 3-7 consecutive days with commits
//     // The probability increases as we get more consecutive days
//     const breakThreshold = getRandomInt(1, 5)
//     return consecutiveDaysWithCommits >= breakThreshold
// }

// // Process commits for a single day
// async function processDay(date: Date): Promise<void> {
//     // Get random number of commits for this day
//     const commitCount = getRandomCommitCount()
//     console.log(`Processing ${commitCount} commits for ${formatDate(date)}`)

//     // Generate timestamps for all commits in this day
//     const commitTimestamps = generateTimestampsForDay(date, commitCount)

//     // Make each commit
//     for (let i = 0; i < commitCount; i++) {
//         const commitTime = commitTimestamps[i]
//         console.log(
//             `Creating commit ${
//                 i + 1
//             }/${commitCount} at ${commitTime.toISOString()}`
//         )

//         try {
//             // Update file content
//             await updateFile()

//             // Commit changes (but don't push yet)
//             await makeCommit(commitTime)
//             commitsSinceLastPush++

//             // Add a small delay between commits
//             const delay = getRandomInt(1000, 2000) // 1-2 seconds
//             await new Promise((resolve) => setTimeout(resolve, delay))
//         } catch (error) {
//             console.error(
//                 `Error processing commit ${i + 1} for ${formatDate(date)}:`,
//                 error
//             )

//             // Add a longer delay after an error
//             console.log("Waiting 10 seconds after error before continuing...")
//             await new Promise((resolve) => setTimeout(resolve, 10000))
//         }
//     }

//     console.log(`Completed all commits for ${formatDate(date)}`)
// }

// src/committer.ts
import { updateFile } from "./files"
import { makeCommit, pushCommits } from "./git"
import { getRandomInt, formatDate, getNextDay } from "./utils"
import { config } from "./config"
import {
    generateCommitSchedule,
    getCommitsForDate,
    validatePatternFits
} from "./scheduler"

// Maximum number of commits before pushing
const MAX_COMMITS_BEFORE_PUSH = 75

// Counter for tracking total commits since last push
let commitsSinceLastPush = 0

// Generate the commit schedule once
const commitSchedule = generateCommitSchedule()

// Generate a sequential array of timestamps for a given day
function generateTimestampsForDay(date: Date, count: number): Date[] {
    // Reset time to start of day
    const baseDate = new Date(date)
    baseDate.setHours(0, 0, 0, 0)

    // Business hours: 9 AM to 6 PM (in seconds: 9*3600 to 18*3600)
    const startOfDay = 9 * 3600 // 9 AM in seconds
    const endOfDay = 18 * 3600 // 6 PM in seconds

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
    // Validate the pattern will fit
    if (!validatePatternFits()) {
        console.error(
            "The PRACHI pattern doesn't fit in the specified date range!"
        )
        process.exit(1)
    }

    // Clone the dates to avoid modifying the originals
    let currentDate = new Date("2024-05-19") // Override to start from May 19, 2024
    const endDate = new Date("2025-05-20") // End on May 20, 2025

    console.log(
        `Starting PRACHI pattern commits from ${formatDate(
            currentDate
        )} to ${formatDate(endDate)}`
    )

    // Process each day in the range
    while (currentDate <= endDate) {
        // Get number of commits for this day based on pattern
        const commitsForToday = getCommitsForDate(currentDate, commitSchedule)

        if (commitsForToday > 0) {
            // This day is part of a letter, make commits
            await processDay(currentDate, commitsForToday)

            // Check if we need to push commits
            if (commitsSinceLastPush >= MAX_COMMITS_BEFORE_PUSH) {
                console.log(
                    `Reached ${commitsSinceLastPush} commits, pushing to remote...`
                )
                await pushCommits()
                commitsSinceLastPush = 0

                // Add a delay after pushing to avoid rate limiting
                const pushDelay = getRandomInt(5000, 15000) // 5-15 seconds
                console.log(`Waiting ${pushDelay / 1000} seconds after push...`)
                await new Promise((resolve) => setTimeout(resolve, pushDelay))
            }
        } else {
            // Skip this day, it's not part of the letter pattern
            console.log(
                `Skipping ${formatDate(currentDate)} (not part of pattern)`
            )
        }

        // Move to the next day
        currentDate = getNextDay(currentDate)
    }

    // Push any remaining commits
    if (commitsSinceLastPush > 0) {
        console.log(`Pushing ${commitsSinceLastPush} remaining commits...`)
        await pushCommits()
    }

    console.log("PRACHI pattern completed successfully!")
}

// Process commits for a single day
async function processDay(date: Date, commitCount: number): Promise<void> {
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

            // Commit changes (but don't push yet)
            await makeCommit(commitTime)
            commitsSinceLastPush++

            // Add a small delay between commits
            const delay = getRandomInt(1000, 2000) // 1-2 seconds
            await new Promise((resolve) => setTimeout(resolve, delay))
        } catch (error) {
            console.error(
                `Error processing commit ${i + 1} for ${formatDate(date)}:`,
                error
            )

            // Add a longer delay after an error
            console.log("Waiting 10 seconds after error before continuing...")
            await new Promise((resolve) => setTimeout(resolve, 10000))
        }
    }

    console.log(`Completed all commits for ${formatDate(date)}`)
}
