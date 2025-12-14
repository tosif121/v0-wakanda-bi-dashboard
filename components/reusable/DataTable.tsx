import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
  SortingState,
  ColumnDef,
} from '@tanstack/react-table';

type DataTableProps<T extends object> = {
  data: T[];
  columns: ColumnDef<T>[];
  searchPlaceholder?: string;
  pageSizeOptions?: number[];
  initialPageSize?: number;
  disableSorting?: boolean;
};

const DataTable = <T extends object>({
  data,
  columns,
  searchPlaceholder = 'Search...',
  pageSizeOptions = [5, 10, 20, 30, 40, 50],
  initialPageSize = 10,
  disableSorting = false,
}: DataTableProps<T>) => {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  const processedColumns = useMemo(
    () =>
      columns.map((column, index) => ({
        ...column,
        id: column.id || ('accessorKey' in column ? column.accessorKey as string : `column-${index}`),
        enableSorting: disableSorting ? false : column.enableSorting !== false,
      })),
    [columns, disableSorting]
  );

  const table = useReactTable({
    data: data || [],
    columns: processedColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    globalFilterFn: 'includesString',
  });

  return (
    <div className="w-full">
      {/* Search and Size Controls - Responsive */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-8 w-full bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700"
          />
        </div>
        <Select
          value={pagination.pageSize.toString()}
          onValueChange={(value: string) => {
            table.setPageSize(Number(value));
          }}
        >
          <SelectTrigger className="w-[130px] border-gray-200 dark:border-gray-700">
            <SelectValue placeholder="Rows per page" />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size} rows
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table with Horizontal Scroll */}
      <div className="w-full overflow-x-auto">
        <div className="rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 min-w-full">
          <Table className="min-w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="whitespace-nowrap px-4 py-2 text-gray-600 dark:text-gray-400 font-medium">
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <Button
                          variant="ghost"
                          onClick={() => header.column.toggleSorting(header.column.getIsSorted() === 'asc')}
                          className="whitespace-nowrap h-auto p-2 text-gray-600 dark:text-gray-400 hover:bg-transparent hover:text-gray-600 dark:hover:text-gray-400"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getIsSorted() === 'asc' ? (
                            <ChevronUp className="ml-2 h-4 w-4" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ChevronDown className="ml-2 h-4 w-4" />
                          ) : (
                            <ChevronsUpDown className="ml-2 h-4 w-4" />
                          )}
                        </Button>
                      ) : (
                        <div className="whitespace-nowrap p-2 text-gray-600 dark:text-gray-400">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors border-gray-200 dark:border-gray-700">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-gray-900 dark:text-white whitespace-nowrap px-4 py-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={table.getAllColumns().length} className="h-24 text-center text-gray-500 dark:text-gray-400">
                    No results found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-4">
        <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(table.getPageCount(), 5) }, (_, i) => {
              const pageIndex = pagination.pageIndex;
              const pageCount = table.getPageCount();
              let startPage = Math.max(0, pageIndex - 2);
              let endPage = Math.min(pageCount - 1, startPage + 4);
              if (endPage - startPage < 4) {
                startPage = Math.max(0, endPage - 4);
              }
              const currentPageIndex = startPage + i;
              if (currentPageIndex >= pageCount) return null;
              return (
                <Button
                  key={currentPageIndex}
                  variant={pagination.pageIndex === currentPageIndex ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => table.setPageIndex(currentPageIndex)}
                  className="w-8 h-8 p-0"
                >
                  {currentPageIndex + 1}
                </Button>
              );
            })}
          </div>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 text-center sm:text-right">
          Page {pagination.pageIndex + 1} of {table.getPageCount()} | {table.getFilteredRowModel().rows.length} total
          rows
        </div>
      </div>
    </div>
  );
};

export default DataTable;
