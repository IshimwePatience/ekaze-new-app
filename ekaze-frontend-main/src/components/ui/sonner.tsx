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
            "group toast !bg-[#1f1f1f] !text-white !border !border-white/10 !rounded-xl !shadow-2xl font-normal text-xs px-4 py-3 flex items-center justify-between gap-3",
          title: "!text-white !font-semibold text-[13px]",
          description: "!text-gray-300 text-xs font-normal",
          actionButton: "group-[.toast]:bg-transparent group-[.toast]:text-[#8ab4f8] hover:group-[.toast]:text-[#d3e3fd] font-semibold text-xs",
          cancelButton: "group-[.toast]:text-gray-400 hover:group-[.toast]:text-white",
        },
        duration: 5000,
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
