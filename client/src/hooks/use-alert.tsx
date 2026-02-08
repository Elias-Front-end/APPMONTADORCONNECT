import { createContext, useContext, useState, ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertCircle, CheckCircle2, XCircle, Info } from "lucide-react";

type AlertType = "info" | "success" | "warning" | "error";

interface AlertOptions {
  title: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string; // If provided, shows cancel button
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}

const icons = {
  info: <Info className="h-6 w-6 text-blue-600" />,
  success: <CheckCircle2 className="h-6 w-6 text-green-600" />,
  warning: <AlertCircle className="h-6 w-6 text-yellow-600" />,
  error: <XCircle className="h-6 w-6 text-red-600" />,
};

export function AlertProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [alertState, setAlertState] = useState<AlertOptions | null>(null);

  const showAlert = (options: AlertOptions) => {
    setAlertState(options);
    setIsOpen(true);
  };

  const hideAlert = () => {
    setIsOpen(false);
    // Don't clear state immediately to allow animation to finish
    setTimeout(() => setAlertState(null), 300);
  };

  const handleConfirm = () => {
    alertState?.onConfirm?.();
    hideAlert();
  };

  const handleCancel = () => {
    alertState?.onCancel?.();
    hideAlert();
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
               {alertState?.type && icons[alertState.type]}
               <AlertDialogTitle>{alertState?.title || "Aviso"}</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base pt-2">
              {alertState?.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {alertState?.cancelText && (
              <AlertDialogCancel onClick={handleCancel}>
                {alertState.cancelText}
              </AlertDialogCancel>
            )}
            <AlertDialogAction 
              onClick={handleConfirm}
              className={alertState?.type === 'error' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              {alertState?.confirmText || "OK"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertContext.Provider>
  );
}
