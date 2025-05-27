import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        variant,
        ...props
      }) {
        // Add custom styling based on variant
        const toastStyles =
          variant === "destructive"
            ? "border-red-400 bg-red-50 dark:bg-red-900/40 dark:border-red-700/40"
            : "";

        const titleStyles =
          variant === "destructive" ? "text-red-600 dark:text-red-300" : "";

        return (
          <Toast
            key={id}
            {...props}
            className={`${props.className || ""} ${toastStyles}`}
          >
            <div className="grid gap-1">
              {title && (
                <ToastTitle className={titleStyles}>{title}</ToastTitle>
              )}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
