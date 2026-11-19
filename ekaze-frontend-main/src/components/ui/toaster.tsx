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
              group relative flex items-center gap-3 w-full
              !rounded-2xl !border-0 !shadow-2xl px-5 py-4
              !bg-[#3565a1] !text-white
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
            {/* White Circle Exclamation Icon matching Screenshot 2 */}
            <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 text-[#3565a1] font-black text-sm leading-none select-none shadow-xs">
              !
            </div>

            <div className="flex flex-col gap-0.5 w-full pr-6">
              {title && (
                <ToastTitle className="!text-left text-sm md:text-[15px] font-bold text-white leading-snug tracking-tight">
                  {title}
                </ToastTitle>
              )}
              {description && description !== title && (
                <ToastDescription className="!text-left text-xs text-white/95 font-medium leading-normal">
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="absolute right-3 top-3 text-white/80 hover:text-white transition-opacity" />
          </Toast>
        );
      })}
      <ToastViewport className="fixed bottom-6 right-6 flex flex-col-reverse gap-3 w-full max-w-[420px] z-[99999] p-0" />
    </ToastProvider>
  );
}