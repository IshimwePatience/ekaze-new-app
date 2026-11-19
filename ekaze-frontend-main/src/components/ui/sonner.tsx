import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast !bg-[#3565a1] !text-white !border-0 !rounded-2xl !shadow-2xl font-semibold text-sm px-5 py-4 flex items-center gap-3",
          title: "!text-white !font-bold text-sm",
          description: "!text-white/90 text-xs font-medium",
          actionButton: "group-[.toast]:bg-white group-[.toast]:text-[#3565a1] font-bold rounded-xl",
          cancelButton: "group-[.toast]:bg-white/20 group-[.toast]:text-white",
        },
        duration: 5000,
      }}
      {...props}
    />
  );
};

export { Toaster, toast };