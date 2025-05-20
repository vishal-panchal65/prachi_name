import dotenv from "dotenv"
import path from "path"

// Load environment variables
dotenv.config()

// Configuration interface
export interface Config {
    timeZone: string
    repoPath: string
    targetFile: string
    githubToken: string
    githubUsername: string
    repoName: string
    branch: string
    minCommitsPerDay: number
    maxCommitsPerDay: number
    startDate: Date
    endDate: Date
}

// Validate that required environment variables are set
const requiredEnvVars = [
    "TIME_ZONE",
    // "MIN_COMMITS_PER_DAY",
    // "MAX_COMMITS_PER_DAY",
    "REPO_PATH",
    "TARGET_FILE",
    "GITHUB_TOKEN",
    "GITHUB_USERNAME",
    "REPO_NAME",
    "BRANCH",
    "START_DATE",
    "END_DATE"
]

const missingEnvVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
)
if (missingEnvVars.length > 0) {
    throw new Error(
        `Missing required environment variables: ${missingEnvVars.join(", ")}`
    )
}

// Parse dates
const startDate = new Date(process.env.START_DATE!)
if (isNaN(startDate.getTime())) {
    throw new Error("Invalid START_DATE format. Please use YYYY-MM-DD format.")
}

const endDate = new Date(process.env.END_DATE!)
if (isNaN(endDate.getTime())) {
    throw new Error("Invalid END_DATE format. Please use YYYY-MM-DD format.")
}

// Validate date range
if (endDate < startDate) {
    throw new Error("END_DATE must be on or after START_DATE")
}

// Configuration object
export const config: Config = {
    repoPath: process.env.REPO_PATH!,
    timeZone: process.env.TIME_ZONE || "UTC",
    targetFile: path.join(process.env.REPO_PATH!, process.env.TARGET_FILE!),
    githubToken: process.env.GITHUB_TOKEN!,
    githubUsername: process.env.GITHUB_USERNAME!,
    repoName: process.env.REPO_NAME!,
    branch: process.env.BRANCH!,
    minCommitsPerDay: parseInt(process.env.MIN_COMMITS_PER_DAY || "2"),
    maxCommitsPerDay: parseInt(process.env.MAX_COMMITS_PER_DAY || "6"),
    startDate,
    endDate
}
