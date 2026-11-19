import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export interface CustomDropdownItemProps {
  id?: string | number;
  label: string;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  active?: boolean;
}

export interface CustomDropdownProps {
  trigger: React.ReactNode;
  items?: (CustomDropdownItemProps | "separator")[];
  sections?: CustomDropdownItemProps[][];
  align?: "start" | "center" | "end";
  sideOffset?: number;
  className?: string;
  widthClass?: string;
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * CustomDropdown
 * Matches the exact design of the app profile dropdown:
 * - bg-white rounded border border-slate-300 shadow-md p-0 overflow-hidden
 * - Clean text-only items: text-[14px] font-semibold text-[#1f2937] hover:bg-[#f3f4f6]
 * - No icons, no header titles
 * - Subtle border-slate-200 dividers between sections
 */
export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  trigger,
  items,
  sections,
  align = "end",
  sideOffset = 4,
  className,
  widthClass = "w-48",
  children,
  open,
  onOpenChange,
}) => {
  return (
    <DropdownMenuPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DropdownMenuPrimitive.Trigger asChild>
        {trigger}
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          sideOffset={sideOffset}
          className={cn(
            "bg-white rounded border border-slate-300 shadow-md p-0 z-[150] overflow-hidden outline-none animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            widthClass,
            className
          )}
        >
          {children ? (
            children
          ) : sections ? (
            sections.map((section, sIdx) => (
              <React.Fragment key={sIdx}>
                {sIdx > 0 && <div className="border-t border-slate-200" />}
                <div className="py-0">
                  {section.map((item, iIdx) => (
                    <DropdownItemButton key={item.id ?? iIdx} item={item} />
                  ))}
                </div>
              </React.Fragment>
            ))
          ) : items ? (
            <div className="py-0">
              {items.map((item, idx) => {
                if (item === "separator") {
                  return <div key={`sep-${idx}`} className="border-t border-slate-200" />;
                }
                return <DropdownItemButton key={item.id ?? idx} item={item} />;
              })}
            </div>
          ) : null}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
};

const DropdownItemButton: React.FC<{ item: CustomDropdownItemProps }> = ({ item }) => {
  return (
    <DropdownMenuPrimitive.Item
      disabled={item.disabled}
      onSelect={() => item.onClick?.()}
      onClick={item.onClick}
      className={cn(
        "w-full flex items-center px-4 py-2.5 text-[14px] font-semibold transition-colors cursor-pointer outline-none select-none text-left",
        item.danger
          ? "text-[#1f2937] hover:bg-[#f3f4f6] hover:text-red-600 focus:bg-[#f3f4f6] focus:text-red-600"
          : item.active
          ? "bg-[#e9ecef] text-[#1f2937]"
          : "text-[#1f2937] hover:bg-[#f3f4f6] focus:bg-[#f3f4f6]",
        item.disabled && "pointer-events-none opacity-40"
      )}
    >
      <span>{item.label}</span>
    </DropdownMenuPrimitive.Item>
  );
};

// Compound primitives for manual building
export const CustomDropdownTrigger = DropdownMenuPrimitive.Trigger;
export const CustomDropdownContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, align = "end", sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "bg-white rounded border border-slate-300 shadow-md p-0 z-[150] overflow-hidden outline-none animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
CustomDropdownContent.displayName = "CustomDropdownContent";

export const CustomDropdownItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    danger?: boolean;
    active?: boolean;
  }
>(({ className, danger, active, children, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "w-full flex items-center px-4 py-2.5 text-[14px] font-semibold transition-colors cursor-pointer outline-none select-none text-left",
      danger
        ? "text-[#1f2937] hover:bg-[#f3f4f6] hover:text-red-600 focus:bg-[#f3f4f6] focus:text-red-600"
        : active
        ? "bg-[#e9ecef] text-[#1f2937]"
        : "text-[#1f2937] hover:bg-[#f3f4f6] focus:bg-[#f3f4f6]",
      props.disabled && "pointer-events-none opacity-40",
      className
    )}
    {...props}
  >
    {children}
  </DropdownMenuPrimitive.Item>
));
CustomDropdownItem.displayName = "CustomDropdownItem";

export const CustomDropdownSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn("border-t border-slate-200", className)}
    {...props}
  />
));
CustomDropdownSeparator.displayName = "CustomDropdownSeparator";

export default CustomDropdown;
