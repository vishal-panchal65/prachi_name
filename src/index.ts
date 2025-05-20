// src/index.ts
import { setupRepo } from "./git"
import { formatDate } from "./utils"
import { config } from "./config"
import { processDateRange } from "./committer"

async function main() {
    try {
        console.log("Starting GitHub Auto Commit Application")
        console.log(`Repository: ${config.githubUsername}/${config.repoName}`)
        console.log(`Branch: ${config.branch}`)
        console.log(`Target file: ${config.targetFile}`)
        console.log(
            `Date range: ${formatDate(config.startDate)} to ${formatDate(
                config.endDate
            )}`
        )
        console.log(
            `Commits per day: ${config.minCommitsPerDay}-${config.maxCommitsPerDay}`
        )

        // Setup git repository
        console.log("Setting up repository...")
        await setupRepo()

        // Process the entire date range
        console.log("Starting commit process...")
        await processDateRange()

        console.log("Application completed successfully")
        process.exit(0)
    } catch (error) {
        console.error("Error in main process:", error)
        process.exit(1)
    }
}

// Run the application
main().catch((error) => {
    console.error("Unhandled error:", error)
    process.exit(1)
})
