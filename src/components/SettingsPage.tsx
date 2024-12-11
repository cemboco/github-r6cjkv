import React, { useState } from 'react';
import { Settings, Download, Trash2 } from 'lucide-react';
import { Profile, Transaction } from '../types/finance';
import { useLanguage } from '../contexts/LanguageContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { currencies } from '../contexts/CurrencyContext';
import { ResetConfirmationModal } from './ResetConfirmationModal';

interface SettingsPageProps {
  profile: Profile;
  transactions: Transaction[];
  onUpdateProfile: (updates: Partial<Profile>) => void;
  onResetData: () => void;
  updateBudgetDistribution: (amount: number, percentages: { fixed: number; needs: number; wants: number; savings: number; }) => void;
}

export function SettingsPage({ 
  profile, 
  transactions, 
  onUpdateProfile, 
  onResetData,
  updateBudgetDistribution 
}: SettingsPageProps) {
  const { t } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const [showResetModal, setShowResetModal] = useState(false);
  const [customDistribution, setCustomDistribution] = useState({
    fixed: 50,
    needs: 30,
    wants: 10,
    savings: 10,
  });

  const handleDistributionChange = (key: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    const newDistribution = { ...customDistribution, [key]: numValue };
    setCustomDistribution(newDistribution);
    
    const total = Object.values(newDistribution).reduce((sum, val) => sum + val, 0);
    
    if (Math.abs(total - 100) < 0.1) {
      const lastSalary = transactions
        .filter(t => t.type === 'income' && t.description.toLowerCase().includes('gehalt'))
        .slice(-1)[0]?.amount || 0;

      if (lastSalary > 0) {
        updateBudgetDistribution(lastSalary, {
          fixed: newDistribution.fixed / 100,
          needs: newDistribution.needs / 100,
          wants: newDistribution.wants / 100,
          savings: newDistribution.savings / 100,
        });
      }
    }
  };

  const exportData = () => {
    const data = {
      profile,
      transactions,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finanzgarten-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResetConfirm = () => {
    onResetData();
    setShowResetModal(false);
  };

  const total = Object.values(customDistribution).reduce((sum, val) => sum + val, 0);
  const isValidTotal = Math.abs(total - 100) < 0.1;

  return (
    <>
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-6">
            <Settings className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {t('settings.title')}
            </h2>
          </div>

          {/* Currency Settings */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {t('settings.currency')}
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('settings.select_currency')}
                </label>
                <select
                  value={currency.code}
                  onChange={(e) => {
                    const newCurrency = currencies.find(c => c.code === e.target.value);
                    if (newCurrency) setCurrency(newCurrency);
                  }}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                >
                  {currencies.map((curr) => (
                    <option key={curr.code} value={curr.code}>
                      {curr.name} ({curr.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Budget Distribution */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              {t('settings.budget_distribution')}
            </h3>
            <div className="space-y-4">
              {Object.entries(customDistribution).map(([category, value]) => (
                <div key={category} className="flex items-center justify-between gap-4">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize min-w-[120px]">
                    {t(`category.${category}`)}
                  </label>
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      value={value}
                      onChange={(e) => handleDistributionChange(category as keyof typeof customDistribution, e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      %
                    </span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between text-sm font-medium pt-2 border-t dark:border-gray-700">
                <span>{t('budget.total')}:</span>
                <span className={`${isValidTotal ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {total.toFixed(1)}%
                </span>
              </div>
              {!isValidTotal && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {t('settings.total_must_be_100')}
                </p>
              )}
            </div>
          </div>

          {/* Data Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('settings.data')}
            </h3>
            
            <button
              onClick={exportData}
              className="flex items-center gap-2 w-full px-4 py-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50"
            >
              <Download className="h-4 w-4" />
              <span>{t('settings.export')}</span>
            </button>

            <button
              onClick={() => setShowResetModal(true)}
              className="flex items-center gap-2 w-full px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50"
            >
              <Trash2 className="h-4 w-4" />
              <span>{t('settings.reset')}</span>
            </button>
          </div>
        </div>
      </div>

      {showResetModal && (
        <ResetConfirmationModal
          onConfirm={handleResetConfirm}
          onClose={() => setShowResetModal(false)}
        />
      )}
    </>
  );
}