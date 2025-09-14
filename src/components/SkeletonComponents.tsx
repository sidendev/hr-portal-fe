import { Skeleton } from './ui/skeleton';

export function EmployeeSkeleton() {
    return (
        <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-3 w-48 mt-2" />
                <Skeleton className="h-3 w-36 mt-1" />
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-8 w-14" />
            </div>
        </div>
    );
}

export function ContractSkeleton() {
    return (
        <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-5 w-20" />
                </div>
                <div className="flex gap-4 mt-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-32" />
                </div>
                <div className="flex gap-4 mt-1">
                    <Skeleton className="h-3 w-28" />
                    <Skeleton className="h-3 w-36" />
                </div>
            </div>
            <div className="flex gap-2">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-8 w-14" />
            </div>
        </div>
    );
}

export function SkeletonList({
    type,
    count = 10,
}: {
    type: 'employee' | 'contract';
    count?: number;
}) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i}>
                    {type === 'employee' ? (
                        <EmployeeSkeleton />
                    ) : (
                        <ContractSkeleton />
                    )}
                </div>
            ))}
        </div>
    );
}
