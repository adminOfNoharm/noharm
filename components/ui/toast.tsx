import * as React from "react"
import { createRoot } from "react-dom/client";
import { cn } from "@/lib/utils"
import { CheckCircle2, XCircle, X } from "lucide-react"

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Toast = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & ToastProps
>(({ className, message, type, onClose, ...props }, ref) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className={cn(
        "fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg p-4 shadow-lg",
        type === 'success' ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900',
        className
      )}
      {...props}
    >
      {type === 'success' ? (
        <CheckCircle2 className="h-5 w-5 text-green-500" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500" />
      )}
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-2 rounded-full p-1 hover:bg-black/5"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
})
Toast.displayName = "Toast"

let toastContainer: HTMLDivElement | null = null;
let root: ReturnType<typeof createRoot> | null = null;

function ensureContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    document.body.appendChild(toastContainer);
    root = createRoot(toastContainer);
  }
  return root!;
}

export const toast = {
  success: (message: string) => {
    const root = ensureContainer();
    const onClose = () => {
      root.render(null);
    };
    root.render(<Toast message={message} type="success" onClose={onClose} />);
  },
  error: (message: string) => {
    const root = ensureContainer();
    const onClose = () => {
      root.render(null);
    };
    root.render(<Toast message={message} type="error" onClose={onClose} />);
  }
}; 