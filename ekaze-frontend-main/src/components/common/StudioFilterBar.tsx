import React, { useState, useRef, useEffect } from "react";
import { X, ChevronLeft, RotateCcw } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterCategory {
  id: string;
  label: string;
  options: FilterOption[];
  currentValue?: string;
  type?: string;
}

interface StudioFilterBarProps {
  categories?: FilterCategory[];
  filters?: FilterCategory[];
  activeFilters?: Record<string, string>;
  onFilterChange?: (categoryId: string, value: string) => void;
  onFilterSelect?: (categoryId: string, value: string) => void;
  onRemoveFilter?: (categoryId: string) => void;
  searchTerm?: string;
  searchValue?: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  onClearAll: () => void;
}

export const StudioFilterBar: React.FC<StudioFilterBarProps> = ({
  categories,
  filters,
  activeFilters,
  onFilterChange,
  onFilterSelect,
  onRemoveFilter,
  searchTerm,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Type to filter...",
  onClearAll,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const term = (searchTerm ?? searchValue ?? "");
  const catList = categories || filters || [];

  const activeMap: Record<string, string> = activeFilters || catList.reduce((acc, cat) => {
    if (cat.currentValue) acc[cat.id] = cat.currentValue;
    return acc;
  }, {} as Record<string, string>);

  const handleSelect = (catId: string, val: string) => {
    if (val === "all" || !val) {
      if (onRemoveFilter) onRemoveFilter(catId);
      else if (onFilterChange) onFilterChange(catId, "all");
      else if (onFilterSelect) onFilterSelect(catId, "all");
    } else {
      if (onFilterSelect) onFilterSelect(catId, val);
      else if (onFilterChange) onFilterChange(catId, val);
    }
  };

  const handleRemove = (catId: string) => {
    if (onRemoveFilter) onRemoveFilter(catId);
    else if (onFilterChange) onFilterChange(catId, "all");
    else if (onFilterSelect) onFilterSelect(catId, "all");
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveCategoryId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasActiveFilters =
    term.trim() !== "" ||
    Object.values(activeMap).some((val) => val && val !== "all");

  const selectedCategory = catList.find((c) => c.id === activeCategoryId);

  return (
    <div className="relative flex flex-wrap items-center gap-3 py-2.5 px-0 bg-white border-b border-slate-200 text-sm">
      {/* YouTube Studio Filter Button */}
      <div className="relative" ref={popoverRef}>
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setActiveCategoryId(null);
          }}
          className="flex items-center gap-2 text-xs font-semibold py-1.5 px-2.5 rounded hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors border border-slate-200"
        >
          {/* YouTube Studio 3-line Filter Icon */}
          <div className="flex flex-col gap-[3px] w-4 items-center justify-center">
            <span className="w-4 h-[2px] bg-slate-700 rounded-full" />
            <span className="w-2.5 h-[2px] bg-slate-700 rounded-full" />
            <span className="w-1.5 h-[2px] bg-slate-700 rounded-full" />
          </div>
          <span>Filter</span>
        </button>

        {/* BLACK Floating YouTube Studio Filter Popover Menu (Drill-down with Back Button) */}
        {isOpen && (
          <div className="absolute left-0 top-full mt-1.5 w-60 bg-[#282828] text-white border border-[#383838] rounded-2xl shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-150">
            {activeCategoryId === null ? (
              /* Step 1: First show category options (e.g., Role, Status) */
              <div className="flex flex-col py-0.5 text-xs">
                {catList.map((cat) => {
                  const hasValue = activeMap[cat.id] && activeMap[cat.id] !== "all";
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategoryId(cat.id)}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#383838] text-slate-200 hover:text-white font-medium transition-colors flex items-center justify-between"
                    >
                      <span>{cat.label}</span>
                      {hasValue && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2478b8]" />
                      )}
                    </button>
                  );
                })}

                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      onClearAll();
                      setIsOpen(false);
                      setActiveCategoryId(null);
                    }}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#383838] text-rose-400 font-medium transition-colors border-t border-[#383838] flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              /* Step 2: Click category -> Show ONLY that sub-menu with BACK button */
              <div className="flex flex-col py-0.5 text-xs">
                <button
                  onClick={() => setActiveCategoryId(null)}
                  className="w-full text-left px-3 py-2 text-slate-400 hover:text-white font-semibold border-b border-[#383838] flex items-center gap-1.5 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-300" />
                  <span>{selectedCategory?.label}</span>
                </button>

                <div className="max-h-64 overflow-y-auto py-1">
                  {selectedCategory?.options.map((opt) => {
                    const isCurrent =
                      activeMap[selectedCategory.id] === opt.value ||
                      (!activeMap[selectedCategory.id] && opt.value === "all");
                    return (
                      <button
                        key={opt.value}
                        onClick={() => {
                          handleSelect(selectedCategory.id, opt.value);
                          setIsOpen(false);
                          setActiveCategoryId(null);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-[#383838] font-medium flex items-center justify-between transition-colors ${isCurrent ? "text-[#38BDF8] font-bold" : "text-slate-200 hover:text-white"
                          }`}
                      >
                        <span>{opt.label}</span>
                        {isCurrent && <span className="text-[#38BDF8]">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inline Direct Search Input */}
      <div className="flex-1 min-w-[150px] max-w-xs">
        <input
          type="text"
          value={term}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none py-1.5 px-1 font-medium"
        />
      </div>

      {/* Active Filter Chips (YouTube Studio Dark Floating Tooltips/Chips) */}
      <div className="flex items-center flex-wrap gap-2">
        {term.trim() !== "" && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl text-xs font-medium bg-[#212121] text-white shadow-sm border border-slate-700 animate-in fade-in duration-150">
            <span>Filter &apos;{term}&apos;</span>
            <button
              onClick={() => onSearchChange("")}
              className="hover:text-red-400 transition-colors ml-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {catList.map((cat) => {
          const val = activeMap[cat.id];
          if (!val || val === "all") return null;
          const optLabel = cat.options.find((o) => o.value === val)?.label || val;
          return (
            <div
              key={cat.id}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-2xl text-xs font-medium bg-[#212121] text-white shadow-sm border border-slate-700 animate-in fade-in duration-150"
            >
              <span>
                {cat.label}: {optLabel}
              </span>
              <button
                onClick={() => handleRemove(cat.id)}
                className="hover:text-red-400 transition-colors ml-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudioFilterBar;
