import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Separator } from './components/ui/separator';
import EmployeesList from './components/EmployeesList';
import ContractsPanel from './components/ContractsPanel';

export default function App() {
    return (
        <div className="max-w-4xl mx-auto p-6">
            <header className="mb-6">
                <h1 className="text-3xl font-semibold tracking-tight">
                    HR Portal
                </h1>
                <p className="text-sm text-brand-muted mt-1">
                    Manage employees and contracts
                </p>
            </header>

            <Tabs defaultValue="employees" className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                    <TabsTrigger value="employees">Employees</TabsTrigger>
                    <TabsTrigger value="contracts">Contracts</TabsTrigger>
                </TabsList>

                <Separator className="my-4" />

                <TabsContent value="employees">
                    <EmployeesList />
                </TabsContent>

                <TabsContent value="contracts">
                    <ContractsPanel />
                </TabsContent>
            </Tabs>
        </div>
    );
}
