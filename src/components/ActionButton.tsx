// src/components/ActionButton.tsx
import React from "react";

interface ActionButtonProps {
  onClick: () => void;
  variant?: "primary" | "secondary" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  darkMode: boolean;
  className?: string;
}

const ActionButton = ({
  onClick,
  variant = "primary",
  size = "sm",
  children,
  darkMode,
  className = "",
}: ActionButtonProps) => {
  const sizeClasses = {
    sm: "p-2",
    md: "px-4 py-2",
    lg: "px-6 py-3",
  };

  const variantClasses = {
    primary: darkMode
      ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-400/40"
      : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-400/40",
    secondary: darkMode
      ? "bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white border border-gray-600"
      : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 border border-gray-300",
    danger:
      "bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white shadow-lg shadow-red-500/25 hover:shadow-red-400/40",
    success:
      "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white shadow-lg shadow-green-500/25 hover:shadow-green-400/40",
  };

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-xl transition-all duration-300 transform hover:scale-110 active:scale-95 ${className}`}
    >
      {children}
    </button>
  );
};

export default ActionButton;
