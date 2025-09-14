import { Button } from './ui/button';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    isLoading = false,
}: PaginationProps) {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
        const pages = [];
        const showEllipsis = totalPages > 7;

        if (!showEllipsis) {
            // shows all pages if 7 or less
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }
                pages.push('ellipsis');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1);
                pages.push('ellipsis');
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // shows first, ellipsis, current-1, current, current+1, ellipsis, last
                pages.push(1);
                pages.push('ellipsis');
                pages.push(currentPage - 1);
                pages.push(currentPage);
                pages.push(currentPage + 1);
                pages.push('ellipsis');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isLoading}
                data-test="pagination-previous"
            >
                Previous
            </Button>

            <div className="flex items-center gap-1">
                {pageNumbers.map((page, index) => (
                    <div key={index}>
                        {page === 'ellipsis' ? (
                            <span className="px-2 text-brand-muted">...</span>
                        ) : (
                            <Button
                                variant={
                                    currentPage === page ? 'default' : 'ghost'
                                }
                                size="sm"
                                onClick={() => onPageChange(page as number)}
                                disabled={isLoading}
                                className={
                                    currentPage === page
                                        ? 'bg-primary text-white hover:opacity-90'
                                        : ''
                                }
                                data-test={`pagination-page-${page}`}
                            >
                                {page}
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isLoading}
                data-test="pagination-next"
            >
                Next
            </Button>
        </div>
    );
}
