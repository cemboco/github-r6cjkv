import React from 'react';
import { useProfile } from '../hooks/useProfile';
import { useCurrency } from '../contexts/CurrencyContext';

interface AmountProps {
  value: number;
  type?: 'income' | 'expense';
  className?: string;
}

export function Amount({ value, type, className = '' }: AmountProps) {
  const { profile } = useProfile();
  const { formatAmount } = useCurrency();
  const hideAmounts = profile.settings?.hideAmounts;

  const formattedAmount = formatAmount(Math.abs(value));
  const prefix = type === 'income' ? '+' : type === 'expense' ? '-' : '';

  return (
    <span className={`${className} ${hideAmounts ? 'blur-md hover:blur-none transition-all duration-300' : ''}`}>
      {prefix}{formattedAmount}
    </span>
  );
}