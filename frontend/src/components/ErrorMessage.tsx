// src/components/ErrorMessage.tsx

import React from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="flex items-center text-red-500">
      <AlertTriangle className="h-6 w-6 mr-2" />
      <span>{message}</span>
    </div>
  );
};

export default ErrorMessage;
