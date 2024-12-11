import { Transaction } from '../types/finance';

export function calculateSpentAmounts(transactions: Transaction[]) {
  const currentCycle = getCurrentCycle(transactions);
  
  const spentAmounts = {
    fixed: 0,
    needs: 0,
    wants: 0,
    savings: 0
  };

  currentCycle.forEach(transaction => {
    if (transaction.type === 'expense' && transaction.category) {
      spentAmounts[transaction.category.type] += transaction.amount;
    }
  });

  return spentAmounts;
}

export function getCurrentCycle(transactions: Transaction[]) {
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const lastIncomeIndex = sortedTransactions.findIndex(t => t.type === 'income');

  if (lastIncomeIndex === -1) {
    return sortedTransactions;
  }

  return sortedTransactions.slice(0, lastIncomeIndex + 1);
}

export function getLastSalaryDate(transactions: Transaction[]): Date | null {
  const lastIncome = transactions.find(t => t.type === 'income');
  return lastIncome ? new Date(lastIncome.date) : null;
}

export function calculateTotalIncome(transactions: Transaction[]): number {
  return transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
}

export function updateBudgetDistribution(amount: number, customPercentages?: {
  fixed: number;
  needs: number;
  wants: number;
  savings: number;
}) {
  const percentages = customPercentages || {
    fixed: 0.5,    // 50% for fixed costs
    needs: 0.3,    // 30% for needs
    wants: 0.1,    // 10% for wants
    savings: 0.1   // 10% for savings
  };

  return {
    fixed: amount * percentages.fixed,
    needs: amount * percentages.needs,
    wants: amount * percentages.wants,
    savings: amount * percentages.savings
  };
}