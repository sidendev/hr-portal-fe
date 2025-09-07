import { useQuery, useMutation } from '@tanstack/react-query';
import { get, post, patch, del } from '../lib/api';
import type { Contract, Employee } from '../types';
import { Button } from '../components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../components/ui/dialog';
import ContractForm from './ContractForm';
import { useState } from 'react';
import { toast } from 'sonner';
import { extractMessage } from '../lib/errors';

export default function ContractsPanel() {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Contract | null>(null);

    const { data: contracts = [], refetch } = useQuery({
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
            refetch();
            setOpen(false);
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
            refetch();
            setOpen(false);
            setEditing(null);
        },
        onError: (e) => toast.error(extractMessage(e)),
    });

    const deleteMut = useMutation({
        mutationFn: (id: number) => del(`/contracts/${id}`),
        onSuccess: () => {
            toast.success('Contract deleted');
            refetch();
        },
        onError: (e) => toast.error(extractMessage(e)),
    });

    const employeeName = (id: number) => {
        const e = employees.find((x) => x.id === id);
        return e ? `${e.firstName} ${e.lastName}` : `#${id}`;
    };

    // checking contracts is an array
    const contractsArray = Array.isArray(contracts) ? contracts : [];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-brand-muted">Manage contracts.</p>
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className="bg-primary text-white hover:opacity-90"
                            data-test="add-contract"
                        >
                            Add contract
                        </Button>
                    </DialogTrigger>
                    <DialogContent data-test="contract-dialog">
                        <DialogHeader>
                            <DialogTitle>
                                {editing ? 'Edit contract' : 'Add contract'}
                            </DialogTitle>
                        </DialogHeader>
                        <ContractForm
                            employees={employees}
                            initial={editing ?? undefined}
                            onSubmit={(values) =>
                                editing
                                    ? updateMut.mutate({
                                          ...editing,
                                          ...values,
                                      })
                                    : createMut.mutate(values)
                            }
                            onCancel={() => {
                                setOpen(false);
                                setEditing(null);
                            }}
                            submitting={
                                createMut.isPending || updateMut.isPending
                            }
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <ul className="divide-y" data-test="contracts-list">
                {contractsArray.length === 0 ? (
                    <li className="py-8 text-center text-sm text-brand-muted">
                        No contracts found. Add your first contract.
                    </li>
                ) : (
                    contractsArray.map((c) => (
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
                                        setOpen(true);
                                    }}
                                    data-test="contract-edit"
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="text-red-600"
                                    onClick={() =>
                                        c.id && deleteMut.mutate(c.id)
                                    }
                                    data-test="contract-remove"
                                >
                                    Remove
                                </Button>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}
