import React from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface PageHeaderBreadcrumbProps {
    title: string;
    items?: Array<{ label: string; onClick?: () => void }>;
    className?: string;
    onDashboardClick?: () => void;
    children?: React.ReactNode;
}

export const PageHeaderBreadcrumb: React.FC<PageHeaderBreadcrumbProps> = ({
    title,
    items,
    className = "",
    onDashboardClick,
    children,
}) => {
    const navigate = useNavigate();

    const handleDashboard = () => {
        if (onDashboardClick) {
            onDashboardClick();
            return;
        }
        // Dispatch events to notify active dashboard container
        window.dispatchEvent(new CustomEvent("dashboard-navigate", { detail: "overview" }));
        window.dispatchEvent(new CustomEvent("admin-tab-change", { detail: "overview" }));
        window.dispatchEvent(new CustomEvent("employer-navigate", { detail: "overview" }));
        window.dispatchEvent(new CustomEvent("worker-navigate", { detail: "overview" }));
        window.dispatchEvent(new CustomEvent("company-navigate", { detail: "overview" }));
        window.dispatchEvent(new CustomEvent("police-navigate", { detail: "overview" }));
        localStorage.setItem("admin_active_tab", "overview");
        localStorage.setItem("employer_active_tab", "overview");

        const params = new URLSearchParams(window.location.search);
        if (params.has("tab")) {
            params.set("tab", "overview");
            navigate({ search: params.toString() }, { replace: true });
        }
    };

    return (
        <div className={`flex items-center justify-between gap-4 py-1.5 ${className}`}>
            <div
                className="flex items-center flex-wrap gap-1 text-[22px] font-normal leading-[28px] text-[#444746]"
                style={{ fontFamily: "'Google Sans', 'Product Sans', 'Roboto', 'Inter', sans-serif" }}
            >
                <button
                    type="button"
                    onClick={handleDashboard}
                    className="text-[#444746] hover:text-[#1f1f1f] hover:underline cursor-pointer transition-colors bg-transparent border-none p-0 font-normal text-[22px] leading-[28px]"
                    style={{ fontFamily: "'Google Sans', 'Product Sans', 'Roboto', 'Inter', sans-serif" }}
                >
                    Dashboard
                </button>

                <ChevronRight className="w-4 h-4 text-[#5f6368] mx-1.5 shrink-0 stroke-[2.2]" />

                {items && items.length > 0 ? (
                    <>
                        {items.map((it, idx) => (
                            <React.Fragment key={idx}>
                                {it.onClick ? (
                                    <button
                                        type="button"
                                        onClick={it.onClick}
                                        className="text-[#444746] hover:text-[#1f1f1f] hover:underline cursor-pointer transition-colors bg-transparent border-none p-0 font-normal text-[22px] leading-[28px]"
                                        style={{ fontFamily: "'Google Sans', 'Product Sans', 'Roboto', 'Inter', sans-serif" }}
                                    >
                                        {it.label}
                                    </button>
                                ) : (
                                    <span
                                        className="text-[#444746] font-normal text-[22px] leading-[28px]"
                                        style={{ fontFamily: "'Google Sans', 'Product Sans', 'Roboto', 'Inter', sans-serif" }}
                                    >
                                        {it.label}
                                    </span>
                                )}
                                <ChevronRight className="w-4 h-4 text-[#5f6368] mx-1.5 shrink-0 stroke-[2.2]" />
                            </React.Fragment>
                        ))}
                        <span
                            className="text-[#1f1f1f] font-normal text-[22px] leading-[28px]"
                            style={{ fontFamily: "'Google Sans', 'Product Sans', 'Roboto', 'Inter', sans-serif" }}
                        >
                            {title}
                        </span>
                    </>
                ) : (
                    <span
                        className="text-[#1f1f1f] font-normal text-[22px] leading-[28px]"
                        style={{ fontFamily: "'Google Sans', 'Product Sans', 'Roboto', 'Inter', sans-serif" }}
                    >
                        {title}
                    </span>
                )}
            </div>

            {children && (
                <div className="flex items-center gap-3 shrink-0">
                    {children}
                </div>
            )}
        </div>
    );
};

export default PageHeaderBreadcrumb;
