"use server";

// ─── Transaction Server Actions ─────────────────────────
// Mutations for the Finances module.
// Same pattern as notes: Server Action → Supabase mutation → revalidatePath.

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/lib/supabase/database.types";

type ActionResponse = {
    success: boolean;
    error?: string;
};

/**
 * Create a new transaction.
 */
export async function createTransaction(
    data: Pick<
        TablesInsert<"transactions">,
        "amount" | "description" | "type" | "category_id" | "payment_method" | "transaction_date"
    >
): Promise<ActionResponse> {
    const supabase = await createClient();

    const { error } = await supabase.from("transactions").insert({
        amount: data.amount,
        description: data.description || null,
        type: data.type,
        category_id: data.category_id || null,
        payment_method: data.payment_method || null,
        transaction_date: data.transaction_date || new Date().toISOString().split("T")[0],
    });

    if (error) {
        console.error("Error creating transaction:", error.message);
        return { success: false, error: error.message };
    }

    revalidatePath("/finances");
    return { success: true };
}

/**
 * Update an existing transaction.
 */
export async function updateTransaction(
    id: string,
    data: Pick<
        TablesUpdate<"transactions">,
        "amount" | "description" | "type" | "category_id" | "payment_method" | "transaction_date"
    >
): Promise<ActionResponse> {
    const supabase = await createClient();

    const { error } = await supabase
        .from("transactions")
        .update({
            amount: data.amount,
            description: data.description || null,
            type: data.type,
            category_id: data.category_id || null,
            payment_method: data.payment_method || null,
            transaction_date: data.transaction_date,
            updated_at: new Date().toISOString(),
        })
        .eq("id", id);

    if (error) {
        console.error("Error updating transaction:", error.message);
        return { success: false, error: error.message };
    }

    revalidatePath("/finances");
    return { success: true };
}

/**
 * Delete a transaction by ID.
 */
export async function deleteTransaction(id: string): Promise<ActionResponse> {
    const supabase = await createClient();

    const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

    if (error) {
        console.error("Error deleting transaction:", error.message);
        return { success: false, error: error.message };
    }

    revalidatePath("/finances");
    return { success: true };
}
