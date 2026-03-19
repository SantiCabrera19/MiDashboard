"use client";

// ─── NewDebtButton ──────────────────────────────────────
// Client Component — opens a modal form to create a new debt.
// Same pattern as NewTransactionButton.

import { useState } from "react";
import { Button, Input, Modal, useToast } from "@/components/ui";
import { createDebt } from "@/lib/actions/debts";

export default function NewDebtButton() {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const toast = useToast();

    const [title, setTitle] = useState("");
    const [totalAmount, setTotalAmount] = useState("");
    const [monthlyPayment, setMonthlyPayment] = useState("");
    const [installmentsTotal, setInstallmentsTotal] = useState("");
    const [nextDueDate, setNextDueDate] = useState("");
    const [notes, setNotes] = useState("");

    function resetForm() {
        setTitle("");
        setTotalAmount("");
        setMonthlyPayment("");
        setInstallmentsTotal("");
        setNextDueDate("");
        setNotes("");
    }

    async function handleSubmit() {
        if (!title.trim() || !totalAmount) {
            toast.error("Title and total amount are required");
            return;
        }
        setSaving(true);
        const result = await createDebt({
            title: title.trim(),
            total_amount: Number(totalAmount),
            monthly_payment: monthlyPayment ? Number(monthlyPayment) : null,
            installments_total: installmentsTotal ? Number(installmentsTotal) : null,
            next_due_date: nextDueDate || null,
            notes: notes.trim() || null,
        });
        setSaving(false);
        if (result.success) {
            toast.success("Debt added");
            setOpen(false);
            resetForm();
        } else {
            toast.error(result.error ?? "Failed to add debt");
        }
    }

    return (
        <>
            <Button size="sm" onClick={() => setOpen(true)}>+ Debt</Button>
            <Modal
                open={open}
                onClose={() => { setOpen(false); resetForm(); }}
                title="Add Debt"
            >
                <div className="space-y-4">
                    <Input
                        label="Title *"
                        placeholder="e.g. Car loan, Credit card"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <Input
                        label="Total amount *"
                        placeholder="0.00"
                        type="number"
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Monthly payment"
                            placeholder="0.00"
                            type="number"
                            value={monthlyPayment}
                            onChange={(e) => setMonthlyPayment(e.target.value)}
                        />
                        <Input
                            label="Total installments"
                            placeholder="12"
                            type="number"
                            value={installmentsTotal}
                            onChange={(e) => setInstallmentsTotal(e.target.value)}
                        />
                    </div>
                    <Input
                        label="Next due date"
                        type="date"
                        value={nextDueDate}
                        onChange={(e) => setNextDueDate(e.target.value)}
                    />
                    <Input
                        label="Notes"
                        placeholder="Optional notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            variant="ghost"
                            onClick={() => { setOpen(false); resetForm(); }}
                            disabled={saving}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleSubmit}
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Add Debt"}
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
