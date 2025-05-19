
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  className?: string;
}

/**
 * Generic DataTable component for displaying tabular data
 * @param data Array of data items to display
 * @param columns Configuration for table columns
 * @param emptyMessage Message to display when there's no data
 * @param className Optional CSS class for the table
 */
function DataTable<T>({ data, columns, emptyMessage = "No data available", className }: DataTableProps<T>) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 dark:bg-gray-800/20 rounded-md border border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className={className}>
        <TableHeader>
          <TableRow className="dark:border-gray-700">
            {columns.map((column, index) => (
              <TableHead key={index} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 dark:border-gray-700">
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex} className={column.className}>
                  {typeof column.accessor === "function" 
                    ? column.accessor(row)
                    : row[column.accessor] as React.ReactNode}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default DataTable;
