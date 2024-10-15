// src/components/ErrorNotification.tsx

import React, { useEffect } from "react";
import { X } from "lucide-react";

interface ErrorNotificationProps {
  message: string;
  onClose: () => void;
}

const ErrorNotification: React.FC<ErrorNotificationProps> = ({
  message,
  onClose,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Display for 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg flex items-center space-x-2 z-50">
      <span>{message}</span>
      <button onClick={onClose} className="focus:outline-none">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default ErrorNotification;
