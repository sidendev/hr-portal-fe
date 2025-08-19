export type Employee = {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    address?: string | null;
};

export type Contract = {
    id?: number;
    employeeId: number;
    contractType: string;
    startDate: string; // YYYY-MM-DD
    endDate?: string | null;
    fullTime: boolean;
    hoursPerWeek?: number | null;
};
