"use client";

import { useEffect, useMemo, useRef } from "react";
import { Card } from "@/components/ui";
import type { Category, MonthlySummary, Transaction } from "@/lib/data/transactions";

interface SpendingChartProps {
    transactions: Transaction[];
    monthlySummary: MonthlySummary[];
    categories: Category[];
}

interface ExpenseByCategory {
    name: string;
    amount: number;
}

interface TrendPoint {
    label: string;
    value: number;
}

function formatCurrency(amount: number): string {
    return `$${Math.round(amount).toLocaleString("es-AR")}`;
}

function getCssColor(variable: string, fallback: string): string {
    const value = getComputedStyle(document.documentElement)
        .getPropertyValue(variable)
        .trim();
    return value || fallback;
}

function isCurrentMonth(dateStr: string): boolean {
    const date = new Date(dateStr);
    const now = new Date();
    return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
    );
}

function buildCurrentMonthExpensesByCategory(
    transactions: Transaction[],
    categories: Category[],
): ExpenseByCategory[] {
    const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));
    const grouped = new Map<string, number>();

    for (const transaction of transactions) {
        if (transaction.type !== "expense") continue;
        if (!isCurrentMonth(transaction.transaction_date)) continue;

        const categoryName = transaction.category_id
            ? (categoryNameById.get(transaction.category_id) ?? "Sin categoria")
            : "Sin categoria";

        const current = grouped.get(categoryName) ?? 0;
        grouped.set(categoryName, current + Math.abs(transaction.amount));
    }

    return [...grouped.entries()]
        .map(([name, amount]) => ({ name, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 8);
}

function buildBalanceTrend(monthlySummary: MonthlySummary[]): TrendPoint[] {
    return monthlySummary
        .slice(0, 6)
        .reverse()
        .map((monthRow) => {
            const rawMonth = monthRow.month ?? "";
            const monthDate = new Date(rawMonth);
            const label = Number.isNaN(monthDate.getTime())
                ? rawMonth
                : monthDate.toLocaleDateString("es-AR", { month: "short" });

            return {
                label,
                value: monthRow.net_balance ?? 0,
            };
        });
}

function drawExpenseBarChart(
    canvas: HTMLCanvasElement,
    containerWidth: number,
    data: ExpenseByCategory[],
) {
    const dpr = window.devicePixelRatio || 1;
    const rowHeight = 32;
    const chartHeight = Math.max(180, data.length * rowHeight + 64);

    canvas.width = Math.floor(containerWidth * dpr);
    canvas.height = Math.floor(chartHeight * dpr);
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${chartHeight}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, containerWidth, chartHeight);

    const colorBrand = getCssColor("--color-brand", "#7c7cff");
    const colorMuted = getCssColor("--color-text-muted", "#8b949e");
    const colorSecondary = getCssColor("--color-text-secondary", "#c9d1d9");
    const colorGrid = getCssColor("--color-border", "#2d333b");

    const leftPad = 108;
    const rightPad = 12;
    const topPad = 24;
    const barHeight = 16;
    const maxValue = Math.max(...data.map((item) => item.amount), 1);
    const usableWidth = Math.max(60, containerWidth - leftPad - rightPad);

    ctx.strokeStyle = colorGrid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(leftPad, topPad - 6);
    ctx.lineTo(leftPad, chartHeight - 16);
    ctx.stroke();

    data.forEach((item, index) => {
        const y = topPad + index * rowHeight;
        const width = (item.amount / maxValue) * usableWidth;

        ctx.fillStyle = colorMuted;
        ctx.font = "12px sans-serif";
        ctx.textBaseline = "middle";
        ctx.fillText(item.name, 8, y + barHeight / 2);

        ctx.fillStyle = colorBrand;
        ctx.fillRect(leftPad, y, width, barHeight);

        ctx.fillStyle = colorSecondary;
        ctx.font = "11px sans-serif";
        ctx.fillText(formatCurrency(item.amount), leftPad + width + 6, y + barHeight / 2);
    });
}

function drawBalanceLineChart(
    canvas: HTMLCanvasElement,
    containerWidth: number,
    points: TrendPoint[],
) {
    const dpr = window.devicePixelRatio || 1;
    const height = 220;

    canvas.width = Math.floor(containerWidth * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, containerWidth, height);

    const colorBrand = getCssColor("--color-brand", "#7c7cff");
    const colorSecondary = getCssColor("--color-text-secondary", "#c9d1d9");
    const colorMuted = getCssColor("--color-text-muted", "#8b949e");
    const colorGrid = getCssColor("--color-border", "#2d333b");
    const colorError = getCssColor("--color-error", "#ef4444");

    const leftPad = 24;
    const rightPad = 12;
    const topPad = 20;
    const bottomPad = 30;

    const minY = Math.min(...points.map((point) => point.value), 0);
    const maxY = Math.max(...points.map((point) => point.value), 0);
    const rangeY = maxY - minY || 1;
    const chartWidth = Math.max(1, containerWidth - leftPad - rightPad);
    const chartHeight = Math.max(1, height - topPad - bottomPad);

    const xFor = (index: number) =>
        leftPad + (index * chartWidth) / Math.max(points.length - 1, 1);

    const yFor = (value: number) =>
        topPad + ((maxY - value) / rangeY) * chartHeight;

    ctx.strokeStyle = colorGrid;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(leftPad, yFor(0));
    ctx.lineTo(containerWidth - rightPad, yFor(0));
    ctx.stroke();

    ctx.strokeStyle = colorBrand;
    ctx.lineWidth = 2;
    ctx.beginPath();
    points.forEach((point, index) => {
        const x = xFor(index);
        const y = yFor(point.value);
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    points.forEach((point, index) => {
        const x = xFor(index);
        const y = yFor(point.value);

        ctx.fillStyle = point.value >= 0 ? colorBrand : colorError;
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = colorMuted;
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.fillText(point.label, x, height - bottomPad + 8);
    });

    const latest = points[points.length - 1];
    if (latest) {
        ctx.fillStyle = colorSecondary;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.font = "12px sans-serif";
        ctx.fillText(`Actual: ${formatCurrency(latest.value)}`, leftPad, 2);
    }
}

export default function SpendingChart({
    transactions,
    monthlySummary,
    categories,
}: SpendingChartProps) {
    const expensesCanvasRef = useRef<HTMLCanvasElement>(null);
    const trendCanvasRef = useRef<HTMLCanvasElement>(null);
    const expensesContainerRef = useRef<HTMLDivElement>(null);
    const trendContainerRef = useRef<HTMLDivElement>(null);

    const expenseData = useMemo(
        () => buildCurrentMonthExpensesByCategory(transactions, categories),
        [transactions, categories],
    );
    const trendData = useMemo(
        () => buildBalanceTrend(monthlySummary),
        [monthlySummary],
    );

    useEffect(() => {
        if (!expensesCanvasRef.current || !trendCanvasRef.current) return;
        if (!expensesContainerRef.current || !trendContainerRef.current) return;

        const redraw = () => {
            const expensesWidth = Math.max(280, expensesContainerRef.current?.clientWidth ?? 0);
            const trendWidth = Math.max(280, trendContainerRef.current?.clientWidth ?? 0);

            drawExpenseBarChart(expensesCanvasRef.current!, expensesWidth, expenseData);
            drawBalanceLineChart(trendCanvasRef.current!, trendWidth, trendData);
        };

        redraw();

        const observer = new ResizeObserver(redraw);
        observer.observe(expensesContainerRef.current);
        observer.observe(trendContainerRef.current);

        return () => observer.disconnect();
    }, [expenseData, trendData]);

    return (
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
            <Card>
                <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
                    Gastos por categoria (mes actual)
                </h3>
                {expenseData.length > 0 ? (
                    <div ref={expensesContainerRef} className="w-full">
                        <canvas ref={expensesCanvasRef} className="block w-full" />
                    </div>
                ) : (
                    <p className="text-sm text-[var(--color-text-muted)]">
                        No hay gastos en el mes actual para graficar.
                    </p>
                )}
            </Card>

            <Card>
                <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
                    Tendencia de balance (ultimos 6 meses)
                </h3>
                {trendData.length > 1 ? (
                    <div ref={trendContainerRef} className="w-full">
                        <canvas ref={trendCanvasRef} className="block w-full" />
                    </div>
                ) : (
                    <p className="text-sm text-[var(--color-text-muted)]">
                        Se necesitan al menos 2 meses para mostrar tendencia.
                    </p>
                )}
            </Card>
        </div>
    );
}
