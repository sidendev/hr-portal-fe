import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEmployeesWithFilters, post, patch, del } from '../lib/api';
import type { Employee } from '../types';
import { toast } from 'sonner';
import { Button } from '../components/ui/button';
import EmployeeForm from './EmployeeForm';
import EditEmployeeForm from './EditEmployeeForm';
import FilterBar, { type FilterState } from './FilterBar';
import { SkeletonList } from './SkeletonComponents';
import { Pagination } from './Pagination';

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
import { useState, useEffect } from 'react';
import { extractMessage } from '../lib/errors';

export default function EmployeesList() {
    const queryClient = useQueryClient();
    const [openAddForm, setOpenAddForm] = useState(false);
    const [openEditForm, setOpenEditForm] = useState(false);
    const [editing, setEditing] = useState<Employee | null>(null);
    const [confirmId, setConfirmId] = useState<number | null>(null);

    // pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // filter state
    const [filters, setFilters] = useState<FilterState>({
        searchQuery: '',
        isExpiring: false,
        isFullTime: null,
        activeFilters: ['all'],
    });

    // resets to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    const {
        data: employeesResponse,
        isLoading,
        error,
    } = useQuery({
        queryKey: ['employees', filters, currentPage],
        queryFn: async () => {
            console.log(
                `[Employees] Fetching page ${currentPage} with size ${pageSize}`
            );

            if (
                filters.activeFilters.length === 1 &&
                filters.activeFilters[0] === 'all'
            ) {
                const data = await getEmployeesWithFilters({
                    page: currentPage,
                    size: pageSize,
                });
                const result = Array.isArray(data) ? data : [];
                console.log(
                    `[Employees] Page ${currentPage} returned ${result.length} items (no filters)`
                );
                return result;
            } else {
                const data = await getEmployeesWithFilters({
                    q: filters.searchQuery || undefined,
                    expiring: filters.isExpiring ? 'current-month' : undefined,
                    contractType:
                        filters.isFullTime === true
                            ? 'full-time'
                            : filters.isFullTime === false
                            ? 'part-time'
                            : undefined,
                    page: currentPage,
                    size: pageSize,
                });
                const result = Array.isArray(data) ? data : [];
                console.log(
                    `[Employees] Page ${currentPage} returned ${result.length} items (with filters)`
                );
                return result;
            }
        },
    });

    const employees = employeesResponse ?? [];

    let totalPages = currentPage;
    if (employees.length === 0 && currentPage > 1) {
        // if current page is empty, so total pages is previous page
        totalPages = currentPage - 1;
    } else if (employees.length === pageSize) {
        // current page is full, so there might be more, show next page as available
        totalPages = currentPage + 1;
    } else if (employees.length < pageSize && employees.length > 0) {
        // current page has some items but not full, then this is the last page
        totalPages = currentPage;
    }

    const createMut = useMutation({
        mutationFn: (body: Omit<Employee, 'id'>) =>
            post<Omit<Employee, 'id'>, Employee>('/employees', body),
        onSuccess: () => {
            toast.success('Employee created');
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            setOpenAddForm(false);
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
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            setOpenEditForm(false);
            setEditing(null);
        },
        onError: (e) => toast.error(extractMessage(e)),
    });

    const deleteMut = useMutation({
        mutationFn: (id: number) => del(`/employees/${id}`),
        onSuccess: () => {
            toast.success('Employee deleted');
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        },
        onError: (e) => toast.error(extractMessage(e)),
    });

    return (
        <div className="space-y-4">
            <FilterBar
                onFilterChange={setFilters}
                currentFilters={filters}
                type="employees"
            />

            <div className="flex items-center justify-between">
                <p className="text-sm text-brand-muted">
                    Click "Edit" to view and modify details.
                </p>
                <Button
                    className="bg-primary text-white hover:opacity-90"
                    data-test="add-employee"
                    onClick={() => setOpenAddForm(true)}
                >
                    Add employee
                </Button>
            </div>

            {/* add employee dialog */}
            <Dialog open={openAddForm} onOpenChange={setOpenAddForm}>
                <DialogContent data-test="add-employee-dialog">
                    <DialogHeader>
                        <DialogTitle>Add employee</DialogTitle>
                    </DialogHeader>
                    <EmployeeForm
                        onSubmit={(values) => createMut.mutate(values)}
                        onCancel={() => setOpenAddForm(false)}
                        submitting={createMut.isPending}
                    />
                </DialogContent>
            </Dialog>

            {/* edit employee dialog */}
            <Dialog open={openEditForm} onOpenChange={setOpenEditForm}>
                <DialogContent data-test="edit-employee-dialog">
                    <DialogHeader>
                        <DialogTitle>Edit employee</DialogTitle>
                    </DialogHeader>
                    {editing && (
                        <EditEmployeeForm
                            employee={editing}
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

            <div data-test="employees-list-container">
                <ul className="divide-y" data-test="employees-list">
                    {isLoading ? (
                        <SkeletonList type="employee" count={10} />
                    ) : error ? (
                        <li className="py-8 text-center text-sm text-red-500">
                            Error loading employees. Please try again.
                        </li>
                    ) : employees.length === 0 ? (
                        <li className="py-8 text-center text-sm text-brand-muted">
                            No employees found. Add your first employee.
                        </li>
                    ) : (
                        employees.map((e) => (
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
                                            setOpenEditForm(true);
                                        }}
                                        data-test="employee-edit-details"
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
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                isLoading={isLoading}
            />

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
