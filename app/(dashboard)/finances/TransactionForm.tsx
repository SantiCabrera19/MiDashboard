"use client";

// ─── TransactionForm ────────────────────────────────────
// Client Component — reusable form for creating AND editing transactions.
//
// Same pattern as NoteForm:
// - No `transaction` prop → create mode
// - With `transaction` prop → edit mode (pre-filled)
// - Receives categories for the dropdown

import { useState, useTransition } from "react";
import { Modal, Input, Button, useToast } from "@/components/ui";
import { createTransaction, updateTransaction } from "@/lib/actions/transactions";
import type { Transaction, Category } from "@/lib/data/transactions";

interface TransactionFormProps {
    transaction?: Transaction;
    categories: Category[];
    open: boolean;
    onClose: () => void;
}

const PAYMENT_METHODS = [
    { value: "cash", label: "Cash" },
    { value: "debit", label: "Debit" },
    { value: "credit", label: "Credit" },
    { value: "transfer", label: "Transfer" },
    { value: "card_payment", label: "Card Payment" },
] as const;

export default function TransactionForm({
    transaction,
    categories,
    open,
    onClose,
}: TransactionFormProps) {
    const isEditing = !!transaction;
    const toast = useToast();

    const [type, setType] = useState(transaction?.type ?? "expense");
    const [amount, setAmount] = useState(transaction?.amount?.toString() ?? "");
    const [description, setDescription] = useState(transaction?.description ?? "");
    const [categoryId, setCategoryId] = useState(transaction?.category_id ?? "");
    const [paymentMethod, setPaymentMethod] = useState(transaction?.payment_method ?? "");
    const [date, setDate] = useState(
        transaction?.transaction_date?.split("T")[0] ??
        new Date().toISOString().split("T")[0]
    );
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    // Filter categories by selected type
    const filteredCategories = categories.filter((c) => c.type === type);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const parsedAmount = parseFloat(amount);
        if (!parsedAmount || parsedAmount <= 0) {
            setError("Amount must be a positive number");
            return;
        }

        startTransition(async () => {
            const payload = {
                amount: parsedAmount,
                description,
                type,
                category_id: categoryId || null,
                payment_method: paymentMethod || null,
                transaction_date: date,
            };

            const result = isEditing
                ? await updateTransaction(transaction.id, payload)
                : await createTransaction(payload);

            if (result.success) {
                if (!isEditing) {
                    setAmount("");
                    setDescription("");
                    setCategoryId("");
                    setPaymentMethod("");
                    setDate(new Date().toISOString().split("T")[0]);
                }
                onClose();
                toast.success(isEditing ? "Transaction updated" : "Transaction created");
            } else {
                setError(result.error ?? "Something went wrong");
                toast.error(result.error ?? "Failed to save transaction");
            }
        });
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEditing ? "Edit Transaction" : "New Transaction"}
            maxWidth="max-w-lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Type toggle — income vs expense */}
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => { setType("income"); setCategoryId(""); }}
                        className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${type === "income"
                            ? "bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40"
                            : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]"
                            }`}
                    >
                        ↑ Income
                    </button>
                    <button
                        type="button"
                        onClick={() => { setType("expense"); setCategoryId(""); }}
                        className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${type === "expense"
                            ? "bg-red-500/20 text-red-400 ring-1 ring-red-500/40"
                            : "bg-[var(--color-surface-2)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-3)]"
                            }`}
                    >
                        ↓ Expense
                    </button>
                </div>

                {/* Amount */}
                <Input
                    label="Amount *"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />

                {/* Description */}
                <Input
                    label="Description"
                    placeholder="What was this for?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                {/* Category dropdown */}
                <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                        Category
                    </label>
                    <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="
              w-full rounded-lg border px-3 py-2
              text-sm text-[var(--color-text-primary)]
              bg-[var(--color-surface-2)]
              border-[var(--color-border)]
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/50
              hover:border-[var(--color-border-hover)]
            "
                    >
                        <option value="">No category</option>
                        {filteredCategories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.icon} {cat.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Payment method + Date — side by side */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-[var(--color-text-primary)]">
                            Payment Method
                        </label>
                        <select
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="
                w-full rounded-lg border px-3 py-2
                text-sm text-[var(--color-text-primary)]
                bg-[var(--color-surface-2)]
                border-[var(--color-border)]
                transition-colors duration-150
                focus:outline-none focus:ring-2 focus:ring-[var(--color-brand)]/50
                hover:border-[var(--color-border-hover)]
              "
                        >
                            <option value="">Select...</option>
                            {PAYMENT_METHODS.map((pm) => (
                                <option key={pm.value} value={pm.value}>
                                    {pm.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="Date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>

                {/* Error */}
                {error && (
                    <p className="text-sm text-red-400" role="alert">
                        {error}
                    </p>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-2">
                    <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
                        Cancel
                    </Button>
                    <Button type="submit" loading={isPending}>
                        {isEditing ? "Save Changes" : "Add Transaction"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
