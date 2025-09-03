import { useForm, Controller } from 'react-hook-form';
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
    onSubmit: (values: ContractFormValues) => void;
    onCancel: () => void;
    submitting?: boolean;
};

export default function AddContractForm({
    employees,
    onSubmit,
    onCancel,
    submitting,
}: Props) {
    const firstEmpId = employees[0]?.id ?? 0;

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        control,
        formState: { errors },
    } = useForm<ContractFormValues>({
        resolver: zodResolver(contractSchema),
        defaultValues: {
            employeeId: firstEmpId,
            contractType: 'Permanent',
            startDate: '',
            endDate: null,
            fullTime: true,
            hoursPerWeek: 40,
        },
    });

    const fullTime = watch('fullTime');
    const contractType = watch('contractType');

    useEffect(() => {
        if (contractType === 'Permanent') {
            setValue('endDate', null);
        }
    }, [contractType, setValue]);

    useEffect(() => {
        if (fullTime) {
            setValue('hoursPerWeek', 40);
        }
    }, [fullTime, setValue]);

    const noEmployees = employees.length === 0;

    const onFormSubmit = (values: ContractFormValues) => {
        const formattedValues = {
            ...values,
            employeeId: Number(values.employeeId),
            hoursPerWeek:
                values.hoursPerWeek !== null
                    ? Number(values.hoursPerWeek)
                    : null,
        };

        console.log('Form values before submission:', formattedValues);
        onSubmit(formattedValues);
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit(onFormSubmit)}>
            <div>
                <Label>Employee</Label>
                {noEmployees ? (
                    <p className="text-sm text-muted-foreground">
                        No employees available — create an employee first.
                    </p>
                ) : (
                    <Select
                        defaultValue={String(firstEmpId)}
                        onValueChange={(v) => setValue('employeeId', Number(v))}
                    >
                        <SelectTrigger data-test="employee-select-trigger">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent data-test="employee-select-content">
                            {employees.map((e) => (
                                <SelectItem
                                    key={e.id}
                                    value={String(e.id)}
                                    data-test="employee-option"
                                    data-value={`${e.firstName} ${e.lastName}`}
                                >
                                    {e.firstName} {e.lastName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
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
                    <select
                        className="w-full border rounded-md h-10 px-3"
                        {...register('contractType')}
                        data-test="contract-type"
                    >
                        <option value="Permanent">Permanent</option>
                        <option value="Contract">Contract</option>
                    </select>
                    {errors.contractType && (
                        <p className="text-xs text-red-600">
                            {errors.contractType.message}
                        </p>
                    )}
                </div>
                <div>
                    <Label>Full-time</Label>
                    <Controller
                        name="fullTime"
                        control={control}
                        render={({ field }) => (
                            <select
                                className="border rounded-md h-10 px-3"
                                value={field.value ? 'true' : 'false'}
                                onChange={(e) =>
                                    field.onChange(e.target.value === 'true')
                                }
                                data-test="full-time-select"
                            >
                                <option value="true">Full-time</option>
                                <option value="false">Part-time</option>
                            </select>
                        )}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Start date</Label>
                    <Input
                        type="date"
                        {...register('startDate')}
                        data-test="start-date"
                    />
                    {errors.startDate && (
                        <p className="text-xs text-red-600">
                            {errors.startDate.message}
                        </p>
                    )}
                </div>
                <div>
                    <Label>End date</Label>
                    <Input
                        type="date"
                        {...register('endDate')}
                        disabled={contractType === 'Permanent'}
                        className={
                            contractType === 'Permanent'
                                ? 'bg-gray-100 cursor-not-allowed'
                                : ''
                        }
                        data-test="end-date"
                    />
                    {contractType === 'Permanent' && (
                        <p className="text-xs text-muted-foreground">
                            Not applicable for permanent contracts
                        </p>
                    )}
                    {errors.endDate && (
                        <p className="text-xs text-red-600">
                            {errors.endDate.message}
                        </p>
                    )}
                </div>
            </div>

            <div>
                <Label>Hours per week</Label>
                <Input
                    type="number"
                    min={0}
                    {...register('hoursPerWeek', { valueAsNumber: true })}
                    data-test="hours-per-week"
                />
                {errors.hoursPerWeek && (
                    <p className="text-xs text-red-600">
                        {errors.hoursPerWeek.message}
                    </p>
                )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={submitting || noEmployees}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    data-test="save-contract"
                >
                    Save
                </Button>
            </div>
        </form>
    );
}
