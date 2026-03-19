// ─── Minesweeper Page ───────────────────────────────────
// Server Component — fetches highscores and renders game.
// Route: /games/minesweeper

import type { Metadata } from "next";
import { getHighscores } from "@/lib/data/highscores";
import MinesweeperGame from "./MinesweeperGame";

export const metadata: Metadata = {
    title: "Minesweeper — MeDashboard",
    description: "Classic Minesweeper game with highscores.",
};

export default async function MinesweeperPage() {
    const [easyScores, mediumScores, hardScores] = await Promise.all([
        getHighscores("easy"),
        getHighscores("medium"),
        getHighscores("hard"),
    ]);

    return (
        <div className="mx-auto max-w-4xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                    💣 Minesweeper
                </h1>
                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    Classic game. Don&apos;t hit a mine.
                </p>
            </div>
            <MinesweeperGame
                initialHighscores={{ easy: easyScores, medium: mediumScores, hard: hardScores }}
            />
        </div>
    );
}
