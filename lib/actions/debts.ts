"use server";

// ─── Debt Server Actions ────────────────────────────────
// Mutations for the Debts module.
// Same pattern as transactions: Server Action → Supabase → revalidatePath.

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ActionResponse = { success: boolean; error?: string };

/**
 * Create a new debt entry.
 */
export async function createDebt(payload: {
    title: string;
    total_amount: number;
    monthly_payment: number | null;
    installments_total: number | null;
    next_due_date: string | null;
    notes: string | null;
}): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { success: false, error: "Not authenticated" };

        const { error } = await supabase.from("debts").insert({
            ...payload,
            user_id: user.id,
            status: "active",
            paid_amount: 0,
            installments_paid: 0,
        });

        if (error) return { success: false, error: error.message };
        revalidatePath("/finances");
        return { success: true };
    } catch {
        return { success: false, error: "An unexpected error occurred" };
    }
}

/**
 * Mark a debt as fully paid.
 */
export async function markDebtPaid(id: string): Promise<ActionResponse> {
    try {
        const supabase = await createClient();

        const { data: debt, error: fetchError } = await supabase
            .from("debts")
            .select("total_amount")
            .eq("id", id)
            .single();

        if (fetchError || !debt) return { success: false, error: "Debt not found" };

        const { error } = await supabase
            .from("debts")
            .update({
                status: "paid",
                paid_amount: debt.total_amount,
                installments_paid: null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (error) return { success: false, error: error.message };
        revalidatePath("/finances");
        return { success: true };
    } catch {
        return { success: false, error: "An unexpected error occurred" };
    }
}

/**
 * Delete a debt by ID.
 */
export async function deleteDebt(id: string): Promise<ActionResponse> {
    try {
        const supabase = await createClient();
        const { error } = await supabase.from("debts").delete().eq("id", id);
        if (error) return { success: false, error: error.message };
        revalidatePath("/finances");
        return { success: true };
    } catch {
        return { success: false, error: "An unexpected error occurred" };
    }
}
