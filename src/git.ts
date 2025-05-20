// src/git.ts
import simpleGit, { SimpleGit } from "simple-git"
import { config } from "./config"
import { getRandomCommitMessage } from "./utils"
import path from "path"

// Initialize git with authentication
export function initGit(): SimpleGit {
    const git = simpleGit(config.repoPath)

    // Set remote URL with token for authentication
    const remoteUrl = `https://${config.githubUsername}:${config.githubToken}@github.com/${config.githubUsername}/${config.repoName}.git`

    return git
}

// Setup repository if needed
export async function setupRepo(): Promise<void> {
    const git = initGit()

    try {
        // Check if .git directory exists
        const isRepo = await git.checkIsRepo()

        if (!isRepo) {
            console.log("Initializing git repository...")
            await git.init()

            // Set remote origin
            const remoteUrl = `https://${config.githubUsername}:${config.githubToken}@github.com/${config.githubUsername}/${config.repoName}.git`
            await git.addRemote("origin", remoteUrl)
        }

        // Setup the branch
        try {
            await git.checkout(config.branch)
        } catch (error) {
            // Branch doesn't exist, create it
            console.log(`Creating and checking out branch ${config.branch}...`)
            await git.checkoutLocalBranch(config.branch)
        }

        // Pull latest changes
        try {
            await git.pull("origin", config.branch)
        } catch (error) {
            console.log(
                "Could not pull from remote. This might be a new repository."
            )
        }
    } catch (error) {
        console.error("Error setting up git repository:", error)
        throw error
    }
}

// Make a commit with a specific date
export async function makeCommit(commitDate?: Date): Promise<void> {
    const git = initGit()

    try {
        const relativePath = path.relative(config.repoPath, config.targetFile)
        await git.add(relativePath)

        const commitOptions: any = {}
        const commitMessage = getRandomCommitMessage()

        // Set commit date if provided
        if (commitDate) {
            const dateString = commitDate.toISOString()
            commitOptions.env = {
                GIT_AUTHOR_DATE: dateString,
                GIT_COMMITTER_DATE: dateString
            }
        }

        await git.commit(commitMessage, commitOptions)
        console.log(`Committed changes with message: ${commitMessage}`)

        // Push to remote
        await git.push("origin", config.branch)
        console.log(`Pushed changes to ${config.branch}`)
    } catch (error) {
        console.error("Error making commit:", error)
        throw error
    }
}
