import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contractSchema, type ContractFormValues } from '../schemas';
import type { Employee } from '../types';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import { useEffect } from 'react';

type Props = {
    employees: Employee[];
    initial?: Partial<ContractFormValues>;
    onSubmit: (values: ContractFormValues) => void;
    onCancel: () => void;
    submitting?: boolean;
};

export default function ContractForm({
    employees,
    initial,
    onSubmit,
    onCancel,
    submitting,
}: Props) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ContractFormValues>({
        resolver: zodResolver(contractSchema),
        defaultValues: {
            employeeId: initial?.employeeId ?? (employees[0]?.id || 0),
            contractType: initial?.contractType ?? 'Permanent',
            startDate: initial?.startDate ?? '',
            endDate: initial?.endDate ?? null,
            fullTime: initial?.fullTime ?? true,
            hoursPerWeek:
                initial?.hoursPerWeek ?? (initial?.fullTime ? 40 : null),
        },
    });

    const fullTime = watch('fullTime');

    useEffect(() => {
        if (fullTime) setValue('hoursPerWeek', 40);
    }, [fullTime, setValue]);

    return (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
                <Label>Employee</Label>
                {employees.length > 0 ? (
                    <Select
                        defaultValue={String(
                            initial?.employeeId ?? employees[0]?.id
                        )}
                        onValueChange={(v) => setValue('employeeId', Number(v))}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {employees.map((e) => (
                                <SelectItem key={e.id} value={String(e.id)}>
                                    {e.firstName} {e.lastName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <p className="text-sm text-muted-foreground">
                        No employees available
                    </p>
                )}
                {errors.employeeId && (
                    <p className="text-xs text-red-600">
                        {errors.employeeId.message}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Contract type</Label>
                    <Input
                        {...register('contractType')}
                        placeholder="Permanent / Fixed-term / Contractor"
                    />
                    {errors.contractType && (
                        <p className="text-xs text-red-600">
                            {errors.contractType.message}
                        </p>
                    )}
                </div>
                <div>
                    <Label>Full-time</Label>
                    <select
                        className="border rounded-md h-10 px-3"
                        {...register('fullTime', { valueAsNumber: false })}
                    >
                        <option value="true">Full-time</option>
                        <option value="false">Part-time</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Start date</Label>
                    <Input type="date" {...register('startDate')} />
                    {errors.startDate && (
                        <p className="text-xs text-red-600">
                            {errors.startDate.message}
                        </p>
                    )}
                </div>
                <div>
                    <Label>End date</Label>
                    <Input type="date" {...register('endDate')} />
                    {errors.endDate && (
                        <p className="text-xs text-red-600">
                            {errors.endDate.message}
                        </p>
                    )}
                </div>
            </div>

            {!fullTime && (
                <div>
                    <Label>Hours per week</Label>
                    <Input
                        type="number"
                        min={0}
                        {...register('hoursPerWeek', { valueAsNumber: true })}
                    />
                    {errors.hoursPerWeek && (
                        <p className="text-xs text-red-600">
                            {errors.hoursPerWeek.message}
                        </p>
                    )}
                </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-brand text-white hover:opacity-90"
                >
                    Save
                </Button>
            </div>
        </form>
    );
}
