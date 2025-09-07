import { useQuery, useMutation } from '@tanstack/react-query';
import { get, post, patch, del } from '../lib/api';
import type { Employee } from '../types';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import EmployeeForm from './EmployeeForm';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { useState } from 'react';
import { extractMessage } from '../lib/errors';

export default function EmployeesList() {
    const [openForm, setOpenForm] = useState(false);
    const [editing, setEditing] = useState<Employee | null>(null);
    const [confirmId, setConfirmId] = useState<number | null>(null);

    const {
        data: employees = [],
        refetch,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['employees'],
        queryFn: async () => {
            const data = await get<Employee[]>('/employees');
            return Array.isArray(data) ? data : [];
        },
    });

    const createMut = useMutation({
        mutationFn: (body: Omit<Employee, 'id'>) =>
            post<Omit<Employee, 'id'>, Employee>('/employees', body),
        onSuccess: () => {
            toast.success('Employee created');
            refetch();
            setOpenForm(false);
        },
        onError: (e) => toast.error(extractMessage(e)),
    });

    const updateMut = useMutation({
        mutationFn: (e: Employee) =>
            patch<Omit<Employee, 'id'>, Employee>(`/employees/${e.id}`, {
                firstName: e.firstName,
                lastName: e.lastName,
                email: e.email,
                mobileNumber: e.mobileNumber,
                address: e.address ?? undefined,
            }),
        onSuccess: () => {
            toast.success('Employee updated');
            refetch();
            setOpenForm(false);
            setEditing(null);
        },
        onError: (e) => toast.error(extractMessage(e)),
    });

    const deleteMut = useMutation({
        mutationFn: (id: number) => del(`/employees/${id}`),
        onSuccess: () => {
            toast.success('Employee deleted');
            refetch();
        },
        onError: (e) => toast.error(extractMessage(e)),
    });

    // checking the structure of employees data
    console.log('Employees data:', employees);

    // checking employees is an array before map
    const employeesArray = Array.isArray(employees) ? employees : [];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm text-brand-muted">
                    Click "Edit" to view and modify details.
                </p>
                <Dialog open={openForm} onOpenChange={setOpenForm}>
                    <DialogTrigger asChild>
                        <Button
                            className="bg-primary text-white hover:opacity-90"
                            data-test="add-employee"
                        >
                            Add employee
                        </Button>
                    </DialogTrigger>
                    <DialogContent data-test="employee-dialog">
                        <DialogHeader>
                            <DialogTitle>
                                {editing ? 'Edit employee' : 'Add employee'}
                            </DialogTitle>
                        </DialogHeader>
                        <EmployeeForm
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
                                setOpenForm(false);
                                setEditing(null);
                            }}
                            submitting={
                                createMut.isPending || updateMut.isPending
                            }
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <ul className="divide-y" data-test="employees-list">
                {isLoading ? (
                    <li className="py-8 text-center text-sm text-brand-muted">
                        Loading…
                    </li>
                ) : error ? (
                    <li className="py-8 text-center text-sm text-red-500">
                        Error loading employees. Please try again.
                    </li>
                ) : employeesArray.length === 0 ? (
                    <li className="py-8 text-center text-sm text-brand-muted">
                        No employees found. Add your first employee.
                    </li>
                ) : (
                    employeesArray.map((e) => (
                        <li
                            key={e.id}
                            className="py-4 flex items-center justify-between"
                            data-test="employee-item"
                        >
                            <div>
                                <div
                                    className="font-medium"
                                    data-test="employee-name"
                                >
                                    {e.firstName} {e.lastName}
                                </div>
                                <div className="text-sm text-brand-muted">
                                    {e.email}
                                </div>
                                {e.address ? (
                                    <div className="text-xs text-brand-muted">
                                        {e.address}
                                    </div>
                                ) : null}
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setEditing(e);
                                        setOpenForm(true);
                                    }}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="ghost"
                                    className="text-red-600"
                                    onClick={() => setConfirmId(e.id)}
                                    data-test="employee-remove"
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
                        <AlertDialogTitle>Delete employee?</AlertDialogTitle>
                    </AlertDialogHeader>
                    <p className="text-sm text-brand-muted">
                        This will also delete all contracts for this employee.
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
