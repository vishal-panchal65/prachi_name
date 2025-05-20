// This is the pixel map for spelling "PRACHI" on the GitHub contribution graph
// Each letter is represented in a 7x5 grid (7 rows, 5 columns)
// 1 means commit on that day, 0 means no commit
// The letters are spaced with 1 column of 0s between them

// P pattern (5x7)
const P = [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0]
]

// R pattern (5x7)
const R = [
    [1, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0],
    [1, 0, 1, 0, 0],
    [1, 0, 0, 1, 0],
    [1, 0, 0, 0, 1]
]

// A pattern (5x7)
const A = [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1]
]

// C pattern (5x7)
const C = [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 1],
    [0, 1, 1, 1, 0]
]

// H pattern (5x7)
const H = [
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1]
]

// I pattern (5x7)
const I = [
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1]
]

// Create a combined pattern with spacing between letters
// Add 1 column of space between each letter
function combineLetters(...letters: number[][][]): number[][] {
    // GitHub contribution graph has 7 rows (days of the week)
    const result: number[][] = [[], [], [], [], [], [], []]

    // Combine all letters with 1 column spacing between them
    for (const letter of letters) {
        // Add the letter
        for (let row = 0; row < 7; row++) {
            result[row] = [...result[row], ...letter[row]]
        }

        // Add one column spacing after each letter except the last one
        if (letter !== letters[letters.length - 1]) {
            for (let row = 0; row < 7; row++) {
                result[row].push(0)
            }
        }
    }

    return result
}

// Combine all letters to spell "PRACHI"
export const PRACHI = combineLetters(P, R, A, C, H, I)

// Export the pattern for use in the committer
export default PRACHI
