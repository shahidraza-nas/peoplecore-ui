"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

interface EmployeePaginationProps {
    currentPage: number;
    totalPages: number;
}

export default function EmployeePagination({
    currentPage,
    totalPages,
}: EmployeePaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const createPageURL = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", pageNumber.toString());
        return `/employees?${params.toString()}`;
    };

    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pages = [];
        const showEllipsisStart = currentPage > 3;
        const showEllipsisEnd = currentPage < totalPages - 2;

        pages.push(
            <PaginationItem key={1}>
                <PaginationLink href={createPageURL(1)} isActive={currentPage === 1}>
                    1
                </PaginationLink>
            </PaginationItem>
        );

        if (showEllipsisStart) {
            pages.push(
                <PaginationItem key="ellipsis-start">
                    <PaginationEllipsis />
                </PaginationItem>
            );
        }
        const startPage = Math.max(2, currentPage - 1);
        const endPage = Math.min(totalPages - 1, currentPage + 1);

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <PaginationItem key={i}>
                    <PaginationLink href={createPageURL(i)} isActive={currentPage === i}>
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        if (showEllipsisEnd) {
            pages.push(
                <PaginationItem key="ellipsis-end">
                    <PaginationEllipsis />
                </PaginationItem>
            );
        }

        if (totalPages > 1) {
            pages.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink
                        href={createPageURL(totalPages)}
                        isActive={currentPage === totalPages}
                    >
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        return pages;
    };

    return (
        <div className="flex items-center justify-between px-2 py-4">
            <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
            </div>
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious
                            href={createPageURL(currentPage - 1)}
                            aria-disabled={currentPage === 1}
                            className={
                                currentPage === 1
                                    ? "pointer-events-none opacity-50"
                                    : undefined
                            }
                        />
                    </PaginationItem>

                    {renderPageNumbers()}

                    <PaginationItem>
                        <PaginationNext
                            href={createPageURL(currentPage + 1)}
                            aria-disabled={currentPage === totalPages}
                            className={
                                currentPage === totalPages
                                    ? "pointer-events-none opacity-50"
                                    : undefined
                            }
                        />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    );
}
