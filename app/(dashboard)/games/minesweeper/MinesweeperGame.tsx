"use client";

// ─── MinesweeperGame ────────────────────────────────────
// Client Component — full Minesweeper game logic.
//
// WHY "use client"?
// - Game state management (useState, useEffect, useCallback)
// - Click/right-click interaction handlers
// - Timer interval
// - All game logic runs entirely in the browser

import { useState, useEffect, useCallback, useRef } from "react";
import { saveHighscore } from "@/lib/actions/highscores";
import type { Highscore } from "@/lib/data/highscores";

// ─── Types ───────────────────────────────────────────────
type Difficulty = "easy" | "medium" | "hard";
type GameStatus = "idle" | "playing" | "won" | "lost";
type AnimState = "idle" | "revealing" | "exploding" | "flagging";

type Cell = {
    isMine: boolean;
    isRevealed: boolean;
    isFlagged: boolean;
    neighborCount: number;
    animState: AnimState;
    row: number;
    col: number;
};

type Board = Cell[][];

// ─── Config ───────────────────────────────────────────────
const DIFFICULTY_CONFIG: Record<Difficulty, { rows: number; cols: number; mines: number; label: string }> = {
    easy:   { rows: 9,  cols: 9,  mines: 10, label: "Easy" },
    medium: { rows: 16, cols: 16, mines: 40, label: "Medium" },
    hard:   { rows: 16, cols: 30, mines: 99, label: "Hard" },
};

// Number colors matching classic Minesweeper
const NUMBER_COLORS: Record<number, string> = {
    1: "#3b82f6",
    2: "#22c55e",
    3: "#ef4444",
    4: "#7c3aed",
    5: "#b91c1c",
    6: "#06b6d4",
    7: "#1a1a1a",
    8: "#6b7280",
};

// ─── Props ────────────────────────────────────────────────
interface MinesweeperGameProps {
    initialHighscores: Record<Difficulty, Highscore[]>;
}

// ─── Helper: create empty board ───────────────────────────
function createEmptyBoard(rows: number, cols: number): Board {
    return Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c): Cell => ({
            isMine: false,
            isRevealed: false,
            isFlagged: false,
            neighborCount: 0,
            animState: "idle",
            row: r,
            col: c,
        }))
    );
}

// ─── Helper: place mines (avoid first click cell) ─────────
function placeMines(board: Board, rows: number, cols: number, mines: number, safeRow: number, safeCol: number): Board {
    const newBoard = board.map(r => r.map(c => ({ ...c })));
    let placed = 0;

    while (placed < mines) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);
        // Avoid the safe cell and its immediate neighbors
        if (
            !newBoard[r][c].isMine &&
            !(Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1)
        ) {
            newBoard[r][c].isMine = true;
            placed++;
        }
    }

    // Calculate neighbor counts
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            if (!newBoard[r][c].isMine) {
                let count = 0;
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        const nr = r + dr;
                        const nc = c + dc;
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newBoard[nr][nc].isMine) {
                            count++;
                        }
                    }
                }
                newBoard[r][c].neighborCount = count;
            }
        }
    }

    return newBoard;
}

// ─── Helper: flood fill reveal (iterative BFS to avoid stack overflow) ───
function floodReveal(board: Board, startRow: number, startCol: number, rows: number, cols: number): Board {
    const newBoard = board.map(r => r.map(c => ({ ...c })));
    const queue: [number, number][] = [[startRow, startCol]];
    const visited = new Set<string>();

    while (queue.length > 0) {
        const [r, c] = queue.shift()!;
        const key = `${r},${c}`;

        if (visited.has(key)) continue;
        if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
        if (newBoard[r][c].isRevealed || newBoard[r][c].isFlagged || newBoard[r][c].isMine) continue;

        visited.add(key);
        newBoard[r][c].isRevealed = true;
        newBoard[r][c].animState = "revealing";

        // If empty cell (no neighbors), expand
        if (newBoard[r][c].neighborCount === 0) {
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr !== 0 || dc !== 0) {
                        queue.push([r + dr, c + dc]);
                    }
                }
            }
        }
    }

    return newBoard;
}

// ─── Helper: check win condition ──────────────────────────
function checkWin(board: Board): boolean {
    return board.every(row =>
        row.every(cell => cell.isMine || cell.isRevealed)
    );
}

// ─── Helper: format time ──────────────────────────────────
function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}:${s.toString().padStart(2, "0")}` : `${s}s`;
}

// ─── Main Component ───────────────────────────────────────
export default function MinesweeperGame({ initialHighscores }: MinesweeperGameProps) {
    const [difficulty, setDifficulty] = useState<Difficulty>("easy");
    const [board, setBoard] = useState<Board>(() => {
        const { rows, cols } = DIFFICULTY_CONFIG.easy;
        return createEmptyBoard(rows, cols);
    });
    const [gameStatus, setGameStatus] = useState<GameStatus>("idle");
    const [minesLeft, setMinesLeft] = useState(DIFFICULTY_CONFIG.easy.mines);
    const [timer, setTimer] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [highscores, setHighscores] = useState(initialHighscores);
    const [showHighscores, setShowHighscores] = useState(false);
    const [savingScore, setSavingScore] = useState(false);
    const [isFirstClick, setIsFirstClick] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const boardContainerRef = useRef<HTMLDivElement>(null);
    const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const longPressCell = useRef<{ row: number; col: number } | null>(null);
    const config = DIFFICULTY_CONFIG[difficulty];

    // ─── Timer ────────────────────────────────────────────
    useEffect(() => {
        if (gameStatus === "playing") {
            timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [gameStatus]);

    // ─── Save highscore on win ─────────────────────────────
    useEffect(() => {
        if (gameStatus === "won" && !savingScore) {
            setSavingScore(true);
            saveHighscore(difficulty, timer).then((result) => {
                if (result.success) {
                    // Refresh highscores optimistically
                    const newScore: Highscore = {
                        id: crypto.randomUUID(),
                        user_id: "",
                        difficulty,
                        time_seconds: timer,
                        created_at: new Date().toISOString(),
                    };
                    setHighscores(prev => ({
                        ...prev,
                        [difficulty]: [...prev[difficulty], newScore]
                            .sort((a, b) => a.time_seconds - b.time_seconds)
                            .slice(0, 10),
                    }));
                }
                setSavingScore(false);
            });
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameStatus]);

    // ─── Auto-fit zoom when difficulty changes ─────────────
    useEffect(() => {
        if (!boardContainerRef.current) return;
        const containerWidth = boardContainerRef.current.clientWidth - 24;
        const containerHeight = window.innerHeight * 0.55;
        const maxCellW = Math.floor(containerWidth / config.cols);
        const maxCellH = Math.floor(containerHeight / config.rows);
        const optimalCell = Math.min(maxCellW, maxCellH, 32);
        const optimalZoom = Math.max(0.4, optimalCell / 32);
        setZoom(+optimalZoom.toFixed(1));
    }, [difficulty, config.cols, config.rows]);

    // ─── Fullscreen toggle ────────────────────────────────
    const toggleFullscreen = useCallback(() => {
        setIsFullscreen(prev => !prev);
    }, []);

    // ─── Reset game ───────────────────────────────────────
    const resetGame = useCallback((diff?: Difficulty) => {
        const d = diff ?? difficulty;
        const { rows, cols, mines } = DIFFICULTY_CONFIG[d];
        setBoard(createEmptyBoard(rows, cols));
        setGameStatus("idle");
        setMinesLeft(mines);
        setTimer(0);
        setIsFirstClick(true);
        if (diff) setDifficulty(diff);
    }, [difficulty]);

    // ─── Handle left click (reveal) ───────────────────────
    const handleClick = useCallback((row: number, col: number) => {
        if (gameStatus === "lost" || gameStatus === "won") return;

        const cell = board[row][col];
        if (cell.isRevealed || cell.isFlagged) return;

        let currentBoard = board;

        // First click: place mines to guarantee safe first click
        if (isFirstClick) {
            currentBoard = placeMines(board, config.rows, config.cols, config.mines, row, col);
            setIsFirstClick(false);
            setGameStatus("playing");
        }

        // Hit a mine
        if (currentBoard[row][col].isMine) {
            const explodedBoard = currentBoard.map(r =>
                r.map(c => {
                    if (c.row === row && c.col === col) {
                        return { ...c, isRevealed: true, animState: "exploding" as AnimState };
                    }
                    if (c.isMine) {
                        return { ...c, isRevealed: true };
                    }
                    return c;
                })
            );
            setBoard(explodedBoard);
            setGameStatus("lost");
            return;
        }

        // Flood reveal
        const revealedBoard = floodReveal(currentBoard, row, col, config.rows, config.cols);
        setBoard(revealedBoard);

        if (checkWin(revealedBoard)) {
            setGameStatus("won");
        }
    }, [board, gameStatus, isFirstClick, config]);

    // ─── Handle right click (flag) ────────────────────────
    const handleRightClick = useCallback((e: React.MouseEvent, row: number, col: number) => {
        e.preventDefault();
        if (gameStatus === "lost" || gameStatus === "won") return;
        const cell = board[row][col];
        if (cell.isRevealed) return;

        const newBoard = board.map(r => r.map(c => {
            if (c.row === row && c.col === col) {
                return { ...c, isFlagged: !c.isFlagged, animState: "flagging" as AnimState };
            }
            return c;
        }));

        setBoard(newBoard);
        setMinesLeft(prev => cell.isFlagged ? prev + 1 : prev - 1);
    }, [board, gameStatus]);

    // ─── Long-press to flag on mobile ─────────────────────
    const handleTouchStart = useCallback((row: number, col: number) => {
        longPressCell.current = { row, col };
        longPressRef.current = setTimeout(() => {
            if (longPressCell.current?.row === row && longPressCell.current?.col === col) {
                const cell = board[row][col];
                if (cell.isRevealed || gameStatus === "lost" || gameStatus === "won") return;
                const newBoard = board.map(r => r.map(c => {
                    if (c.row === row && c.col === col) {
                        return { ...c, isFlagged: !c.isFlagged };
                    }
                    return c;
                }));
                setBoard(newBoard);
                setMinesLeft(prev => cell.isFlagged ? prev + 1 : prev - 1);
            }
        }, 400);
    }, [board, gameStatus]);

    const handleTouchEnd = useCallback(() => {
        if (longPressRef.current) clearTimeout(longPressRef.current);
        longPressCell.current = null;
    }, []);

    // ─── Cell size based on zoom ───────────────────────────
    const cellSize = Math.round(32 * zoom);

    // ─── Render ───────────────────────────────────────────
    return (
        <div className={isFullscreen
            ? "fixed inset-0 z-50 bg-[var(--color-surface-0)] flex flex-col p-3 gap-3"
            : "space-y-3"
        }>
            {/* ── Row 1: difficulty + smiley + fullscreen ── */}
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex rounded-lg overflow-hidden border border-[var(--color-border)]">
                    {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                        <button
                            key={d}
                            onClick={() => resetGame(d)}
                            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                                difficulty === d
                                    ? "bg-[var(--color-brand)] text-white"
                                    : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]"
                            }`}
                        >
                            {DIFFICULTY_CONFIG[d].label}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => resetGame()}
                    className="px-3 py-1.5 text-lg rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] transition-colors"
                    title="New game"
                >
                    {gameStatus === "won" ? "😎" : gameStatus === "lost" ? "😵" : "🙂"}
                </button>

                <button
                    onClick={toggleFullscreen}
                    className="px-3 py-1.5 text-sm rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] transition-colors text-[var(--color-text-secondary)]"
                    title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                >
                    {isFullscreen ? "⊠" : "⊞"}
                </button>

                {/* Stats */}
                <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] ml-auto">
                    <span className="text-sm font-mono text-[var(--color-text-primary)]">
                        💣 {minesLeft}
                    </span>
                    <span className="text-sm font-mono text-[var(--color-text-primary)]">
                        ⏱️ {formatTime(timer)}
                    </span>
                </div>
            </div>

            {/* ── Row 2: zoom + scores ── */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setZoom(z => Math.max(0.4, +(z - 0.1).toFixed(1)))}
                        className="w-7 h-7 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] text-sm font-bold text-[var(--color-text-secondary)] transition-colors"
                    >
                        −
                    </button>
                    <span className="text-xs text-[var(--color-text-muted)] w-10 text-center">
                        {Math.round(zoom * 100)}%
                    </span>
                    <button
                        onClick={() => setZoom(z => Math.min(2, +(z + 0.1).toFixed(1)))}
                        className="w-7 h-7 rounded-md bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] text-sm font-bold text-[var(--color-text-secondary)] transition-colors"
                    >
                        +
                    </button>
                </div>

                <span className="text-xs text-[var(--color-text-muted)]">
                    Hold cell to flag on mobile
                </span>

                <button
                    onClick={() => setShowHighscores(s => !s)}
                    className="ml-auto px-3 py-1.5 text-sm font-medium rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] text-[var(--color-text-secondary)] transition-colors"
                >
                    🏆 Scores
                </button>
            </div>

            {/* ── Status message ── */}
            {(gameStatus === "won" || gameStatus === "lost") && (
                <div className={`rounded-xl border px-4 py-3 text-sm font-medium text-center ${
                    gameStatus === "won"
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                        : "border-red-500/40 bg-red-500/10 text-red-400"
                }`}>
                    {gameStatus === "won"
                        ? `🎉 You won in ${formatTime(timer)}! ${savingScore ? "Saving score..." : "Score saved!"}`
                        : "💥 Game over! Click 🙂 to try again."}
                </div>
            )}

            {/* ── Board ── */}
            <div
                ref={boardContainerRef}
                className={`overflow-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-3 ${
                    isFullscreen ? "flex-1" : ""
                }`}
                style={isFullscreen ? undefined : { maxHeight: "60vh" }}
            >
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${config.cols}, ${cellSize}px)`,
                        gap: "2px",
                        width: "fit-content",
                    }}
                >
                    {board.map((row) =>
                        row.map((cell) => (
                            <CellButton
                                key={`${cell.row}-${cell.col}`}
                                cell={cell}
                                size={cellSize}
                                gameStatus={gameStatus}
                                onClick={() => handleClick(cell.row, cell.col)}
                                onRightClick={(e) => handleRightClick(e, cell.row, cell.col)}
                                onTouchStart={() => handleTouchStart(cell.row, cell.col)}
                                onTouchEnd={handleTouchEnd}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* ── Highscores panel ── */}
            {showHighscores && (
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-4">
                    <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
                        🏆 Personal Highscores
                    </h2>
                    <div className="grid grid-cols-3 gap-4">
                        {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                            <div key={d}>
                                <p className="text-xs font-medium text-[var(--color-text-secondary)] mb-2">
                                    {DIFFICULTY_CONFIG[d].label}
                                </p>
                                {highscores[d].length === 0 ? (
                                    <p className="text-xs text-[var(--color-text-muted)]">No scores yet</p>
                                ) : (
                                    <ol className="space-y-1">
                                        {highscores[d].slice(0, 5).map((score, i) => (
                                            <li key={score.id} className="flex items-center gap-2 text-xs">
                                                <span className="text-[var(--color-text-muted)] w-4">{i + 1}.</span>
                                                <span className="font-mono text-[var(--color-text-primary)]">
                                                    {formatTime(score.time_seconds)}
                                                </span>
                                            </li>
                                        ))}
                                    </ol>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── CellButton sub-component ─────────────────────────────
interface CellButtonProps {
    cell: Cell;
    size: number;
    gameStatus: GameStatus;
    onClick: () => void;
    onRightClick: (e: React.MouseEvent) => void;
    onTouchStart: () => void;
    onTouchEnd: () => void;
}

function CellButton({ cell, size, gameStatus, onClick, onRightClick, onTouchStart, onTouchEnd }: CellButtonProps) {
    const fontSize = Math.max(10, Math.round(size * 0.45));

    // Revealed mine that exploded
    if (cell.isRevealed && cell.isMine) {
        return (
            <div
                style={{ width: size, height: size, fontSize }}
                className={`
                    flex items-center justify-center rounded-sm select-none
                    ${cell.animState === "exploding"
                        ? "bg-red-500 animate-pulse"
                        : "bg-[var(--color-surface-3)]"}
                `}
            >
                💣
            </div>
        );
    }

    // Revealed safe cell
    if (cell.isRevealed) {
        return (
            <div
                style={{
                    width: size,
                    height: size,
                    fontSize,
                    color: cell.neighborCount > 0 ? NUMBER_COLORS[cell.neighborCount] : "transparent",
                }}
                className="flex items-center justify-center rounded-sm font-bold bg-[var(--color-surface-0)] border border-[var(--color-border)] select-none"
            >
                {cell.neighborCount > 0 ? cell.neighborCount : ""}
            </div>
        );
    }

    // Flagged cell
    if (cell.isFlagged) {
        return (
            <button
                style={{ width: size, height: size, fontSize }}
                className="flex items-center justify-center rounded-sm bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] transition-colors select-none"
                onClick={onClick}
                onContextMenu={onRightClick}
                onTouchStart={(e) => { e.preventDefault(); onTouchStart(); }}
                onTouchEnd={onTouchEnd}
            >
                🚩
            </button>
        );
    }

    // Unrevealed cell
    return (
        <button
            style={{ width: size, height: size }}
            className={`
                rounded-sm border border-[var(--color-border)] transition-all duration-75 select-none
                ${gameStatus === "lost" || gameStatus === "won"
                    ? "bg-[var(--color-surface-2)] cursor-default"
                    : "bg-[var(--color-surface-2)] hover:bg-[var(--color-surface-3)] active:scale-95 cursor-pointer"
                }
            `}
            onClick={onClick}
            onContextMenu={onRightClick}
            onTouchStart={(e) => { e.preventDefault(); onTouchStart(); }}
            onTouchEnd={onTouchEnd}
        />
    );
}
