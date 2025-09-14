import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '../lib/api';
import type { Contract, Employee } from '../types';
import { Button } from '../components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '../components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../components/ui/alert-dialog';
import ContractForm from './ContractForm';
import EditContractForm from './EditContractForm';
import { useState } from 'react';
import { toast } from 'sonner';
import { extractMessage } from '../lib/errors';

export default function ContractsPanel() {
    const queryClient = useQueryClient();
    const [openAddForm, setOpenAddForm] = useState(false);
    const [openEditForm, setOpenEditForm] = useState(false);
    const [editing, setEditing] = useState<Contract | null>(null);
    const [confirmId, setConfirmId] = useState<number | null>(null);

    const {
        data: contracts = [],
        isLoading: contractsLoading,
        error: contractsError,
    } = useQuery({
        queryKey: ['contracts'],
        queryFn: async () => {
            const data = await get<Contract[]>('/contracts');
            return Array.isArray(data) ? data : [];
        },
    });

    const { data: employees = [] } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => {
            const data = await get<Employee[]>('/employees');
            return Array.isArray(data) ? data : [];
        },
    });

    const createMut = useMutation({
        mutationFn: (c: Omit<Contract, 'id'>) =>
            post<typeof c, Contract>('/contracts', c),
        onSuccess: () => {
            toast.success('Contract created');
            queryClient.invalidateQueries({ queryKey: ['contracts'] });
            setOpenAddForm(false);
        },
        onError: (e) => toast.error(extractMessage(e)),
    });

    const updateMut = useMutation({
        mutationFn: (c: Contract) => {
            const { id, ...body } = c;
            return patch<Omit<Contract, 'id'>, Contract>(
                `/contracts/${id}`,
                body
            );
        },
        onSuccess: () => {
            toast.success('Contract updated');
            queryClient.invalidateQueries({ queryKey: ['contracts'] });
            setOpenEditForm(false);
            setEditing(null);
        },
        onError: (e) => toast.error(extractMessage(e)),
    });

    const deleteMut = useMutation({
        mutationFn: (id: number) => del(`/contracts/${id}`),
        onSuccess: () => {
            toast.success('Contract deleted');
            queryClient.invalidateQueries({ queryKey: ['contracts'] });
        },
        onError: (e) => toast.error(extractMessage(e)),
    });

    const employeeName = (id: number) => {
        const e = employees.find((x) => x.id === id);
        return e ? `${e.firstName} ${e.lastName}` : `#${id}`;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-brand-muted">Manage contracts.</p>
                <Button
                    className="bg-primary text-white hover:opacity-90"
                    data-test="add-contract"
                    onClick={() => setOpenAddForm(true)}
                >
                    Add contract
                </Button>
            </div>

            {/* Add Contract Dialog */}
            <Dialog open={openAddForm} onOpenChange={setOpenAddForm}>
                <DialogContent data-test="add-contract-dialog">
                    <DialogHeader>
                        <DialogTitle>Add contract</DialogTitle>
                    </DialogHeader>
                    <ContractForm
                        employees={employees}
                        onSubmit={(values) => createMut.mutate(values)}
                        onCancel={() => setOpenAddForm(false)}
                        submitting={createMut.isPending}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Contract Dialog */}
            <Dialog open={openEditForm} onOpenChange={setOpenEditForm}>
                <DialogContent data-test="edit-contract-dialog">
                    <DialogHeader>
                        <DialogTitle>Edit contract</DialogTitle>
                    </DialogHeader>
                    {editing && (
                        <EditContractForm
                            contract={editing}
                            employees={employees}
                            onSubmit={(values) =>
                                updateMut.mutate({
                                    ...editing,
                                    ...values,
                                })
                            }
                            onCancel={() => {
                                setOpenEditForm(false);
                                setEditing(null);
                            }}
                            submitting={updateMut.isPending}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <ul className="divide-y" data-test="contracts-list">
                {contractsLoading ? (
                    <li className="py-8 text-center text-sm text-brand-muted">
                        Loading…
                    </li>
                ) : contractsError ? (
                    <li className="py-8 text-center text-sm text-red-500">
                        Error loading contracts. Please try again.
                    </li>
                ) : contracts.length === 0 ? (
                    <li className="py-8 text-center text-sm text-brand-muted">
                        No contracts found. Add your first contract.
                    </li>
                ) : (
                    contracts.map((c) => (
                        <li
                            key={c.id}
                            className="py-4 flex items-center justify-between"
                            data-test="contract-item"
                        >
                            <div>
                                <div
                                    className="font-medium"
                                    data-test="contract-employee-name"
                                >
                                    {employeeName(c.employeeId)}
                                </div>
                                <div
                                    className="text-sm text-brand-muted"
                                    data-test="contract-type-text"
                                >
                                    {c.contractType} •{' '}
                                    {c.fullTime ? 'Full-time' : 'Part-time'} •{' '}
                                    {c.startDate} → {c.endDate ?? 'ongoing'}
                                </div>
                                <div
                                    className="text-xs text-brand-muted"
                                    data-test="contract-hours"
                                >
                                    {c.hoursPerWeek} hours/week
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setEditing(c);
                                        setOpenEditForm(true);
                                    }}
                                    data-test="contract-edit"
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="text-red-600"
                                    onClick={() => c.id && setConfirmId(c.id)}
                                    data-test="contract-remove"
                                >
                                    Remove
                                </Button>
                            </div>
                        </li>
                    ))
                )}
            </ul>

            <AlertDialog
                open={confirmId !== null}
                onOpenChange={(o) => !o && setConfirmId(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete contract?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <p className="text-sm text-brand-muted">
                        This will permanently delete this contract.
                    </p>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={() => {
                                if (confirmId != null)
                                    deleteMut.mutate(confirmId);
                                setConfirmId(null);
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
