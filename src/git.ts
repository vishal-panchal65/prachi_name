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

        const commitMessage = getRandomCommitMessage()

        // Set commit date if provided
        if (commitDate) {
            const dateString = commitDate.toISOString()

            // Using environment variables directly
            process.env.GIT_AUTHOR_DATE = dateString
            process.env.GIT_COMMITTER_DATE = dateString

            await git.commit(commitMessage)

            // Clean up environment variables after commit
            delete process.env.GIT_AUTHOR_DATE
            delete process.env.GIT_COMMITTER_DATE
        } else {
            await git.commit(commitMessage)
        }

        console.log(`Created commit with message: ${commitMessage}`)

        // We don't push here - pushing will be done in batch later
    } catch (error) {
        console.error("Error making commit:", error)
        throw error
    }
}

// Push all accumulated commits to remote
export async function pushCommits(): Promise<void> {
    const git = initGit()

    try {
        console.log("Pushing all accumulated commits to remote...")
        await git.push("origin", config.branch)
        console.log(`Successfully pushed all commits to ${config.branch}`)
    } catch (error) {
        console.error("Error pushing commits:", error)
        throw error
    }
}
