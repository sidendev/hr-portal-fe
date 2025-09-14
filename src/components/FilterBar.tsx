import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search } from 'lucide-react';

export interface FilterState {
    searchQuery: string;
    isExpiring: boolean;
    isFullTime: boolean | null;
    activeFilters: string[]; // track which filter buttons are active
}

interface Props {
    onFilterChange: (filters: FilterState) => void;
    currentFilters: FilterState;
    type: 'employees' | 'contracts';
}

export default function FilterBar({
    onFilterChange,
    currentFilters,
    type,
}: Props) {
    const [searchInput, setSearchInput] = useState(currentFilters.searchQuery);

    const handleSearchSubmit = () => {
        const trimmedSearch = searchInput.trim();
        let newActiveFilters = [...currentFilters.activeFilters];

        if (trimmedSearch) {
            newActiveFilters = newActiveFilters.filter((f) => f !== 'all');
            if (!newActiveFilters.includes('search')) {
                newActiveFilters.push('search');
            }
        } else {
            newActiveFilters = newActiveFilters.filter((f) => f !== 'search');
        }

        // if no filters are active, default to 'all'
        if (newActiveFilters.length === 0) {
            newActiveFilters = ['all'];
        }

        onFilterChange({
            ...currentFilters,
            searchQuery: trimmedSearch,
            activeFilters: newActiveFilters,
        });
    };

    const handleFilterToggle = (filterType: string) => {
        let newFilters = { ...currentFilters };
        let newActiveFilters = [...currentFilters.activeFilters];

        switch (filterType) {
            case 'all':
                newFilters = {
                    searchQuery: '',
                    isExpiring: false,
                    isFullTime: null,
                    activeFilters: ['all'],
                };
                setSearchInput('');
                break;

            case 'expiring':
                newFilters.isExpiring = !newFilters.isExpiring;
                if (newFilters.isExpiring) {
                    newActiveFilters = newActiveFilters.filter(
                        (f) => f !== 'all'
                    );
                    if (!newActiveFilters.includes('expiring')) {
                        newActiveFilters.push('expiring');
                    }
                } else {
                    newActiveFilters = newActiveFilters.filter(
                        (f) => f !== 'expiring'
                    );
                }
                break;

            case 'full-time':
                newFilters.isFullTime =
                    newFilters.isFullTime === true ? null : true;
                if (newFilters.isFullTime === true) {
                    newActiveFilters = newActiveFilters.filter(
                        (f) => f !== 'all' && f !== 'part-time'
                    );
                    if (!newActiveFilters.includes('full-time')) {
                        newActiveFilters.push('full-time');
                    }
                } else {
                    newActiveFilters = newActiveFilters.filter(
                        (f) => f !== 'full-time'
                    );
                }
                break;

            case 'part-time':
                newFilters.isFullTime =
                    newFilters.isFullTime === false ? null : false;
                if (newFilters.isFullTime === false) {
                    newActiveFilters = newActiveFilters.filter(
                        (f) => f !== 'all' && f !== 'full-time'
                    );
                    if (!newActiveFilters.includes('part-time')) {
                        newActiveFilters.push('part-time');
                    }
                } else {
                    newActiveFilters = newActiveFilters.filter(
                        (f) => f !== 'part-time'
                    );
                }
                break;
        }

        // if no specific filters are active, default to 'all'
        if (
            newActiveFilters.length === 0 ||
            (!newFilters.searchQuery &&
                !newFilters.isExpiring &&
                newFilters.isFullTime === null)
        ) {
            newActiveFilters = ['all'];
        }

        newFilters.activeFilters = newActiveFilters;
        onFilterChange(newFilters);
    };

    const isActive = (filterType: string) => {
        return currentFilters.activeFilters.includes(filterType);
    };

    const getButtonVariant = (filterType: string) => {
        return isActive(filterType) ? 'default' : 'outline';
    };

    const getButtonClassName = (filterType: string) => {
        const baseClasses = 'text-sm transition-all duration-200';
        return isActive(filterType)
            ? `${baseClasses} bg-primary hover:bg-primary/90 text-white border-primary`
            : `${baseClasses} hover:bg-primary/10 hover:border-primary/50`;
    };

    return (
        <div
            className="border-b bg-gray-50/30 p-4"
            data-test={`${type}-filter-bar`}
        >
            <div className="flex flex-wrap gap-3 items-center justify-between">
                <div className="flex flex-wrap gap-3 items-center">
                    <Button
                        variant={getButtonVariant('all')}
                        size="sm"
                        onClick={() => handleFilterToggle('all')}
                        data-test={`${type}-filter-all`}
                        className={getButtonClassName('all')}
                    >
                        All
                    </Button>

                    <Button
                        variant={getButtonVariant('expiring')}
                        size="sm"
                        onClick={() => handleFilterToggle('expiring')}
                        data-test={`${type}-filter-expiring`}
                        className={getButtonClassName('expiring')}
                    >
                        Expiring
                    </Button>

                    <Button
                        variant={getButtonVariant('full-time')}
                        size="sm"
                        onClick={() => handleFilterToggle('full-time')}
                        data-test={`${type}-filter-full-time`}
                        className={getButtonClassName('full-time')}
                    >
                        Full-time
                    </Button>

                    <Button
                        variant={getButtonVariant('part-time')}
                        size="sm"
                        onClick={() => handleFilterToggle('part-time')}
                        data-test={`${type}-filter-part-time`}
                        className={getButtonClassName('part-time')}
                    >
                        Part-time
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Input
                        placeholder="Search name..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyPress={(e) =>
                            e.key === 'Enter' && handleSearchSubmit()
                        }
                        data-test={`${type}-search-input`}
                        className="w-48 h-8 text-sm"
                    />
                    <Button
                        onClick={handleSearchSubmit}
                        data-test={`${type}-search-button`}
                        size="sm"
                        className="h-8 w-8 p-0 bg-primary hover:bg-primary/90 text-white"
                    >
                        <Search className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* active filters indicator */}
            {!isActive('all') && (
                <div className="mt-2 flex items-center gap-2">
                    <div className="flex gap-1">
                        {currentFilters.activeFilters
                            .filter((f) => f !== 'all')
                            .map((filter) => (
                                <span
                                    key={filter}
                                    className="inline-flex items-center px-2 py-1 text-xs bg-primary/10 text-primary rounded-full border border-primary/20"
                                    data-test={`${type}-active-filter-${filter}`}
                                >
                                    {filter === 'search' &&
                                    currentFilters.searchQuery
                                        ? `"${currentFilters.searchQuery}"`
                                        : filter.replace('-', ' ')}
                                </span>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}
