import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeSchema, type EmployeeFormValues } from '../schemas';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

type Props = {
    onSubmit: (values: EmployeeFormValues) => void;
    onCancel: () => void;
    submitting?: boolean;
};

export default function AddEmployeeForm({
    onSubmit,
    onCancel,
    submitting,
}: Props) {
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            mobileNumber: '',
            address: '',
        },
    });

    return (
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>First name</Label>
                    <Input {...register('firstName')} />
                    {errors.firstName && (
                        <p className="text-xs text-red-600">
                            {errors.firstName.message}
                        </p>
                    )}
                </div>
                <div>
                    <Label>Last name</Label>
                    <Input {...register('lastName')} />
                    {errors.lastName && (
                        <p className="text-xs text-red-600">
                            {errors.lastName.message}
                        </p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Email</Label>
                    <Input type="email" {...register('email')} />
                    {errors.email && (
                        <p className="text-xs text-red-600">
                            {errors.email.message}
                        </p>
                    )}
                </div>
                <div>
                    <Label>Mobile number</Label>
                    <Input {...register('mobileNumber')} />
                    {errors.mobileNumber && (
                        <p className="text-xs text-red-600">
                            {errors.mobileNumber.message}
                        </p>
                    )}
                </div>
            </div>

            <div>
                <Label>Address</Label>
                <Input {...register('address')} />
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                    Save
                </Button>
            </div>
        </form>
    );
}
