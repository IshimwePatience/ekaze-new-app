import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  perPageOptions?: number[];
  className?: string;
}

export const YouTubeStudioPagination: React.FC<PaginationProps> = ({
  currentPage,
  lastPage,
  perPage,
  total,
  onPageChange,
  onPerPageChange,
  perPageOptions = [10, 30, 50],
  className = "",
}) => {
  if (total <= 0) return null;

  const from = (currentPage - 1) * perPage + 1;
  const to = Math.min(currentPage * perPage, total);

  return (
    <div className={`flex items-center justify-end gap-6 px-4 py-3 border-t border-slate-200 bg-white text-xs text-slate-600 font-normal select-none ${className}`}>
      {/* Rows per page Selector */}
      <div className="flex items-center gap-2">
        <span className="text-slate-600">Rows per page:</span>
        <Select
          value={perPage.toString()}
          onValueChange={(val) => onPerPageChange(Number(val))}
        >
          <SelectTrigger className="h-7 border-none bg-transparent shadow-none text-xs font-medium text-slate-800 focus:ring-0 px-1 gap-1 cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl border border-slate-200 bg-slate-900 text-white min-w-[70px] shadow-lg">
            {perPageOptions.map((opt) => (
              <SelectItem key={opt} value={opt.toString()} className="text-xs focus:bg-slate-800 focus:text-white cursor-pointer py-1.5">
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Count Range Display */}
      <div className="text-slate-700 font-normal">
        {from}–{to} of {total}
      </div>

      {/* Navigation Arrow Controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-1 hover:bg-slate-100 rounded text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
          title="First page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1 hover:bg-slate-100 rounded text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
          title="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= lastPage}
          className="p-1 hover:bg-slate-100 rounded text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
          title="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(lastPage)}
          disabled={currentPage >= lastPage}
          className="p-1 hover:bg-slate-100 rounded text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer transition-colors"
          title="Last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
