import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider duration={5000}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast
            key={id}
            {...props}
            className="
              group relative flex items-center justify-between gap-3 w-full
              !rounded-xl !border !border-white/10 !shadow-2xl px-4 py-3
              !bg-[#1f1f1f] !text-white select-none
              data-[state=open]:animate-in
              data-[state=open]:slide-in-from-bottom-5
              data-[state=open]:fade-in
              data-[state=open]:duration-300
              data-[state=open]:ease-out
              data-[state=closed]:animate-out
              data-[state=closed]:slide-out-to-right-full
              data-[state=closed]:fade-out
              data-[state=closed]:duration-200
              data-[state=closed]:ease-in
            "
          >
            <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-2">
              {title && (
                <ToastTitle className="!text-left text-[13px] font-semibold text-white leading-snug tracking-tight">
                  {title}
                </ToastTitle>
              )}
              {description && description !== title && (
                <ToastDescription className="!text-left text-xs text-gray-300 font-normal leading-normal line-clamp-2">
                  {description}
                </ToastDescription>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {action ? (
                <div className="text-xs font-semibold text-[#8ab4f8] hover:text-[#d3e3fd] transition-colors">
                  {action}
                </div>
              ) : null}
              <ToastClose className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10" />
            </div>
          </Toast>
        );
      })}
      <ToastViewport className="fixed bottom-5 right-6 flex flex-col-reverse gap-2.5 w-full max-w-[380px] sm:max-w-[420px] z-[99999] p-0" />
    </ToastProvider>
  );
}
