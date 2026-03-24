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
type InputMode = "dig" | "flag";

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
    const [cellFontSize, setCellFontSize] = useState(12);
    const [highscores, setHighscores] = useState(initialHighscores);
    const [showHighscores, setShowHighscores] = useState(false);
    const [savingScore, setSavingScore] = useState(false);
    const [isFirstClick, setIsFirstClick] = useState(true);
    const [inputMode, setInputMode] = useState<InputMode>("dig");

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const boardContainerRef = useRef<HTMLDivElement>(null);
    const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const longPressCell = useRef<{ row: number; col: number } | null>(null);
    const touchMovedRef = useRef(false);
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

    // ─── Responsive cell font sizing via ResizeObserver ────
    useEffect(() => {
        const container = boardContainerRef.current;
        if (!container) return;

        const calcFontSize = () => {
            const padding = 24; // p-3 = 12px each side
            const gapTotal = (config.cols - 1) * 2; // 2px gap
            const available = container.clientWidth - padding - gapTotal;
            const cellWidth = available / config.cols;
            const nextFontSize = Math.round(Math.max(8, Math.min(cellWidth * 0.52, 14)));
            setCellFontSize(nextFontSize);
        };

        // Initial calc
        calcFontSize();

        const observer = new ResizeObserver(() => calcFontSize());
        observer.observe(container);
        return () => observer.disconnect();
    }, [config.cols]);

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

    // ─── Handle left click (reveal or flag based on mode) ───
    const handleClick = useCallback((row: number, col: number) => {
        // Flag mode: left click = flag/unflag
        if (inputMode === "flag") {
            if (gameStatus === "lost" || gameStatus === "won") return;
            const c = board[row][col];
            if (c.isRevealed) return;
            const newBoard = board.map(r => r.map(cell => {
                if (cell.row === row && cell.col === col) {
                    return { ...cell, isFlagged: !cell.isFlagged };
                }
                return cell;
            }));
            setBoard(newBoard);
            setMinesLeft(prev => c.isFlagged ? prev + 1 : prev - 1);
            return;
        }

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
    }, [board, gameStatus, isFirstClick, config, inputMode]);

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
        touchMovedRef.current = false;
        longPressCell.current = { row, col };
        longPressRef.current = setTimeout(() => {
            if (
                !touchMovedRef.current &&
                longPressCell.current?.row === row &&
                longPressCell.current?.col === col
            ) {
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
        }, 450);
    }, [board, gameStatus]);

    const handleTouchMove = useCallback(() => {
        touchMovedRef.current = true;
        if (longPressRef.current) clearTimeout(longPressRef.current);
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (longPressRef.current) clearTimeout(longPressRef.current);
    }, []);



    // ─── Render ───────────────────────────────────────────
    return (
        <div className="space-y-3">

            {/* ─── HUD ─────────────────────────────────────────── */}
            <div className="flex items-center gap-2 flex-wrap">

                {/* Difficulty */}
                <div className="flex rounded-lg overflow-hidden border border-[var(--color-border)]">
                    {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                        <button
                            key={d}
                            onClick={() => { resetGame(d); setInputMode("dig"); }}
                            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                                difficulty === d
                                    ? "bg-[var(--color-brand)] text-white"
                                    : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)]"
                            }`}
                        >
                            {DIFFICULTY_CONFIG[d].label}
                        </button>
                    ))}
                </div>

                {/* Smiley reset */}
                <button
                    onClick={() => { resetGame(); setInputMode("dig"); }}
                    className="w-9 h-9 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] transition-all active:scale-95 text-xl flex items-center justify-center"
                    title="New game"
                >
                    {gameStatus === "won" ? "😎" : gameStatus === "lost" ? "😵" : "🙂"}
                </button>

                {/* Mine counter */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] font-mono text-sm">
                    <span>💣</span>
                    <span className="text-[var(--color-text-primary)] tabular-nums w-6 text-center">{minesLeft}</span>
                </div>

                {/* Timer */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] font-mono text-sm">
                    <span>⏱️</span>
                    <span className="text-[var(--color-text-primary)] tabular-nums w-10">{formatTime(timer)}</span>
                </div>

                {/* Highscores */}
                <button
                    onClick={() => setShowHighscores(s => !s)}
                    className={`ml-auto px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                        showHighscores
                            ? "bg-[var(--color-brand)] text-white border-[var(--color-brand)]"
                            : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:bg-[var(--color-surface-3)]"
                    }`}
                >
                    🏆
                </button>
            </div>

            {/* ─── Mode toggle + hint ───────────────────────────── */}
            <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--color-text-muted)]">Mode:</span>
                <div className="flex rounded-lg overflow-hidden border border-[var(--color-border)]">
                    <button
                        onClick={() => setInputMode("dig")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                            inputMode === "dig"
                                ? "bg-[#1e40af] text-blue-100"
                                : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-3)]"
                        }`}
                    >
                        <span>⛏️</span> Dig
                    </button>
                    <button
                        onClick={() => setInputMode("flag")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                            inputMode === "flag"
                                ? "bg-[#991b1b] text-red-100"
                                : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)] hover:bg-[var(--color-surface-3)]"
                        }`}
                    >
                        <span>🚩</span> Flag
                    </button>
                </div>
                <span className="text-xs text-[var(--color-text-muted)] hidden sm:inline">
                    {inputMode === "dig" ? "Click to reveal · Right-click to flag · Hold on mobile" : "Click to place/remove flag · Right-click also flags"}
                </span>
            </div>

            {/* ─── Status banner ──────────────────────────────── */}
            {(gameStatus === "won" || gameStatus === "lost") && (
                <div className={`rounded-xl border px-4 py-3 text-sm font-semibold text-center ${
                    gameStatus === "won"
                        ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                        : "border-red-500/50 bg-red-500/10 text-red-300"
                }`}>
                    {gameStatus === "won"
                        ? `🎉 You won in ${formatTime(timer)}! ${savingScore ? "Saving..." : "Score saved!"}`
                        : "💥 Game over! Press 🙂 to play again."}
                </div>
            )}

            {/* ─── Board ──────────────────────────────────────── */}
            <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                <div
                    ref={boardContainerRef}
                    className="rounded-xl border border-[var(--color-border)] bg-[#0a0a0f] p-3 select-none"
                    style={{
                        display: "inline-block",
                        overflow: "auto",
                        overscrollBehavior: "contain",
                        WebkitOverflowScrolling: "touch",
                    }}
                >
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: `repeat(${config.cols}, minmax(28px, 40px))`,
                            gap: "2px",
                            width: "100%",
                        }}
                    >
                        {board.map((row) =>
                            row.map((cell) => (
                                <CellButton
                                    key={`${cell.row}-${cell.col}`}
                                    cell={cell}
                                    fontSize={cellFontSize}
                                    gameStatus={gameStatus}
                                    inputMode={inputMode}
                                    onClick={() => handleClick(cell.row, cell.col)}
                                    onRightClick={(e) => handleRightClick(e, cell.row, cell.col)}
                                    onTouchStart={() => handleTouchStart(cell.row, cell.col)}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Highscores panel ─────────────────────────────── */}
            {showHighscores && (
                <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-4">
                    <h2 className="text-sm font-semibold text-[var(--color-text-primary)] mb-3">
                        🏆 Personal Best
                    </h2>
                    <div className="grid grid-cols-3 gap-6">
                        {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
                            <div key={d}>
                                <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-2">
                                    {DIFFICULTY_CONFIG[d].label}
                                </p>
                                {highscores[d].length === 0 ? (
                                    <p className="text-xs text-[var(--color-text-muted)] italic">No scores yet</p>
                                ) : (
                                    <ol className="space-y-1.5">
                                        {highscores[d].slice(0, 5).map((score, i) => (
                                            <li key={score.id} className="flex items-center gap-2">
                                                <span className={`text-xs font-bold w-4 ${i === 0 ? "text-yellow-400" : "text-[var(--color-text-muted)]"}`}>
                                                    {i === 0 ? "🥇" : `${i + 1}.`}
                                                </span>
                                                <span className="font-mono text-sm text-[var(--color-text-primary)]">
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
    fontSize: number;
    gameStatus: GameStatus;
    inputMode: InputMode;
    onClick: () => void;
    onRightClick: (e: React.MouseEvent) => void;
    onTouchStart: () => void;
    onTouchMove: () => void;
    onTouchEnd: () => void;
}

function CellButton({ cell, fontSize, gameStatus, inputMode, onClick, onRightClick, onTouchStart, onTouchMove, onTouchEnd }: CellButtonProps) {
    const isInteractive = gameStatus !== "lost" && gameStatus !== "won";

    // Revealed mine
    if (cell.isRevealed && cell.isMine) {
        return (
            <div
                style={{ width: "100%", aspectRatio: "1 / 1", fontSize }}
                className={`flex items-center justify-center select-none ${
                    cell.animState === "exploding"
                        ? "bg-red-600 ring-1 ring-red-400 animate-pulse rounded-sm"
                        : "bg-[#3a1a1a] rounded-sm"
                }`}
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
                    width: "100%",
                    aspectRatio: "1 / 1",
                    fontSize,
                    color: cell.neighborCount > 0 ? NUMBER_COLORS[cell.neighborCount] : "transparent",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                }}
                className="flex items-center justify-center rounded-sm select-none bg-[#0f0f16] border border-[#1a1a26]"
            >
                {cell.neighborCount > 0 ? cell.neighborCount : ""}
            </div>
        );
    }

    // Flagged cell
    if (cell.isFlagged) {
        return (
            <button
                style={{ width: "100%", aspectRatio: "1 / 1", fontSize, borderWidth: "1px" }}
                className={`flex items-center justify-center rounded-sm select-none transition-colors duration-75
                    bg-[#2d1a0e] border-t-[#7c4a1e] border-l-[#7c4a1e] border-b-[#3d2010] border-r-[#3d2010]
                    ${isInteractive ? "hover:brightness-110 active:scale-95" : "cursor-default"}
                `}
                onClick={onClick}
                onContextMenu={onRightClick}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                🚩
            </button>
        );
    }

    // Unrevealed cell — 3D raised look
    const cursorClass = !isInteractive
        ? "cursor-default"
        : inputMode === "flag"
        ? "cursor-cell"
        : "cursor-pointer";

    return (
        <button
            style={{ width: "100%", aspectRatio: "1 / 1", borderWidth: "1px" }}
            className={`rounded-sm select-none transition-colors duration-75
                bg-[#1e2030]
                border-t-[#3a3d52] border-l-[#3a3d52]
                border-b-[#0d0e14] border-r-[#0d0e14]
                ${isInteractive
                    ? `hover:bg-[#262940] hover:border-t-[#4a4d66] active:bg-[#161820] active:border-t-[#0d0e14] active:border-l-[#0d0e14] active:border-b-[#3a3d52] active:border-r-[#3a3d52] ${cursorClass}`
                    : ""
                }
            `}
            onClick={onClick}
            onContextMenu={onRightClick}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        />
    );
}
