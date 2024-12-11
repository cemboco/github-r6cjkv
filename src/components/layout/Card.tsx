import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 ${className}`}>
      {children}
    </div>
  );
}