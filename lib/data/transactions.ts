// ─── Transactions Data Queries ───────────────────────────
// Server-side data functions for the Finances module.
//
// Covers: transactions, categories, monthly_summary view, and financial_config.
// Each function returns typed data from Supabase.

import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/supabase/database.types";

// Re-export row types for use in components
export type Transaction = Tables<"transactions">;
export type Category = Tables<"categories">;
export type MonthlySummary = Tables<"monthly_summary">;
export type FinancialConfig = Tables<"financial_config">;

/**
 * Fetch recent transactions, ordered by most recent first.
 * Optionally limit the number of results.
 */
export async function getTransactions(limit?: number): Promise<Transaction[]> {
    const supabase = await createClient();

    let query = supabase
        .from("transactions")
        .select()
        .order("transaction_date", { ascending: false });

    if (limit) {
        query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching transactions:", error.message);
        return [];
    }

    return data;
}

/**
 * Fetch all categories (for filters and transaction forms).
 */
export async function getCategories(): Promise<Category[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("categories")
        .select()
        .order("name");

    if (error) {
        console.error("Error fetching categories:", error.message);
        return [];
    }

    return data;
}

/**
 * Fetch the monthly summary view (income, expenses, balance per month).
 */
export async function getMonthlySummary(): Promise<MonthlySummary[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("monthly_summary")
        .select()
        .order("month", { ascending: false });

    if (error) {
        console.error("Error fetching monthly summary:", error.message);
        return [];
    }

    return data;
}

/**
 * Fetch the user's financial configuration (balance, credit, currency).
 */
export async function getFinancialConfig(): Promise<FinancialConfig | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("financial_config")
        .select()
        .single();

    if (error) {
        console.error("Error fetching financial config:", error.message);
        return null;
    }

    return data;
}
