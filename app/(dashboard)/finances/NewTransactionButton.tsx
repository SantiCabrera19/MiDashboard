"use client";

// ─── NewTransactionButton ───────────────────────────────
// Thin Client Component wrapper — same pattern as NewNoteButton.
// Receives categories from the Server Component parent.

import { useState } from "react";
import { Button } from "@/components/ui";
import TransactionForm from "./TransactionForm";
import type { Category } from "@/lib/data/transactions";

interface NewTransactionButtonProps {
    categories: Category[];
}

export default function NewTransactionButton({ categories }: NewTransactionButtonProps) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button size="sm" onClick={() => setOpen(true)}>
                + Transaction
            </Button>
            <TransactionForm
                categories={categories}
                open={open}
                onClose={() => setOpen(false)}
            />
        </>
    );
}
