// Полнофункциональный сайт для совместного бюджета Артура и Валерии

import { useState, useEffect, useCallback } from 'react';
import SyncModeSelector from './components/SyncModeSelector.jsx';
import { useFirebase } from './hooks/useFirebase.js';
import { 
  createFamily as createFamilyFirestore, 
  joinFamily as joinFamilyFirestore,
  subscribeToFamilyData,
  subscribeToTransactions,
  subscribeToGoals,
  addTransaction as addTransactionFirestore,
  updateGoal,
  updateFamilyBalances
} from './firebase-service.js';

// Компонент модального окна
const Modal = ({ isOpen, onClose, title, children, theme = 'dark' }) => {
  if (!isOpen) return null;

  const modalBg = theme === 'light' ? 'bg-white border border-gray-200' : 'bg-gray-800';
  const textColor = theme === 'light' ? 'text-gray-800' : 'text-white';
  const textSecondary = theme === 'light' ? 'text-gray-600' : 'text-gray-400';

  const handleBackdropClick = (e) => {
    // Закрываем модальное окно только при клике на backdrop, не на содержимое
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className={`${modalBg} rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className={`text-xl font-semibold ${textColor}`}>{title}</h3>
          <button
            onClick={onClose}
            className={`${textSecondary} hover:${textColor} text-2xl`}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Компонент уведомлений
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-600' : type === 'warning' ? 'bg-yellow-600' : 'bg-red-600';
  
  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white p-4 rounded-lg shadow-lg z-50 max-w-sm`}>
      <div className="flex justify-between items-center">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-xl">×</button>
      </div>
    </div>
  );
};

// Компонент для карточки баланса
const BalanceCard = ({ user, balance, color, icon, onEdit, transactions = [], formatCurrency }) => {
  const income = Array.isArray(transactions) ? transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) : 0;
  const expenses = Array.isArray(transactions) ? transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) : 0;
  
  return (
    <div 
      className="p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer"
      style={{ 
        background: `linear-gradient(135deg, ${color}20 0%, ${color}05 100%)`,
        border: `1px solid ${color}30`
      }}
      onClick={() => onEdit && onEdit(user)}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">{user}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-white mb-2">
        {formatCurrency ? formatCurrency(balance || 0) : `${(balance || 0).toLocaleString('ru-RU')} zł`}
      </div>
      <div className="text-sm text-gray-300 mb-2">
        Доступно для трат
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span className="text-green-400">+{formatCurrency ? formatCurrency(income || 0) : `${(income || 0).toLocaleString('ru-RU')} zł`}</span>
        <span className="text-red-400">-{formatCurrency ? formatCurrency(expenses || 0) : `${(expenses || 0).toLocaleString('ru-RU')} zł`}</span>
      </div>
    </div>
  );
};

// Компонент навигационного меню
const Navigation = ({ activeTab, setActiveTab, theme, toggleTheme }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Главная', icon: '🏠' },
    { id: 'transactions', label: 'Операции', icon: '💳' },
    { id: 'goals', label: 'Цели', icon: '🎯' },
    { id: 'categories', label: 'Категории', icon: '📂' },
    { id: 'analytics', label: 'Аналитика', icon: '📊' },
    { id: 'settings', label: 'Настройки', icon: '⚙️' },
  ];

  const navBg = theme === 'light' ? 'bg-white/60 backdrop-blur-sm border border-gray-200' : 'bg-gray-800/50 backdrop-blur-sm';
  const buttonActive = theme === 'light' ? 'bg-blue-500 text-white' : 'bg-blue-600 text-white';
  const buttonInactive = theme === 'light' 
    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900' 
    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white';
  const themeButtonStyle = theme === 'light'
    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900'
    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white';

  return (
    <nav className={`${navBg} p-3 sm:p-4 rounded-xl mb-6`}>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-2 items-start sm:items-center">
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 flex-1 w-full sm:w-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1 sm:gap-2 px-2 sm:px-4 py-3 sm:py-2 rounded-lg transition-all duration-200 text-xs sm:text-sm ${
                activeTab === item.id ? buttonActive : buttonInactive
              }`}
            >
              <span className="text-lg sm:text-base">{item.icon}</span>
              <span className="text-center sm:hidden">{item.label}</span>
              <span className="hidden sm:block">{item.label}</span>
            </button>
          ))}
        </div>
        <div className="hidden sm:block">
          <button
            onClick={toggleTheme}
            className={`${themeButtonStyle} px-3 py-2 rounded-lg transition-all duration-200`}
            title="Переключить тему"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
};

// Компонент цели
const GoalCard = ({ goal, onEdit, onDelete, onAddMoney, formatCurrency }) => {
  const progress = (goal.current / goal.target) * 100;
  
  // Расчет времени до дедлайна
  const getDeadlineInfo = () => {
    if (!goal.deadline) return null;
    
    const now = new Date();
    const deadline = new Date(goal.deadline);
    const diffTime = deadline - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: 'Просрочено', color: 'text-red-400', icon: '⚠️' };
    } else if (diffDays === 0) {
      return { text: 'Сегодня!', color: 'text-orange-400', icon: '🔥' };
    } else if (diffDays <= 7) {
      return { text: `${diffDays} дн.`, color: 'text-yellow-400', icon: '⚡' };
    } else if (diffDays <= 30) {
      return { text: `${diffDays} дн.`, color: 'text-blue-400', icon: '📅' };
    } else {
      return { text: `${diffDays} дн.`, color: 'text-gray-400', icon: '📅' };
    }
  };

  const deadlineInfo = getDeadlineInfo();
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-white">{goal.title}</h4>
          {goal.deadline && deadlineInfo && (
            <div className={`text-xs ${deadlineInfo.color} mt-1 flex items-center gap-1`}>
              <span>{deadlineInfo.icon}</span>
              <span>Дедлайн: {deadlineInfo.text}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onAddMoney(goal)}
            className="text-green-400 hover:text-green-300 text-sm"
            title="Добавить деньги"
          >
            💰
          </button>
          <button
            onClick={() => onEdit(goal)}
            className="text-blue-400 hover:text-blue-300 text-sm"
            title="Редактировать"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="text-red-400 hover:text-red-300 text-sm"
            title="Удалить"
          >
            🗑️
          </button>
        </div>
      </div>
      <div className="flex justify-between text-sm text-gray-300 mb-2">
        <span>{formatCurrency ? formatCurrency(goal.current || 0) : `${(goal.current || 0).toLocaleString('ru-RU')} zł`}</span>
        <span>{formatCurrency ? formatCurrency(goal.target || 0) : `${(goal.target || 0).toLocaleString('ru-RU')} zł`}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3 mb-2">
        <div 
          className="h-3 rounded-full transition-all duration-500"
          style={{ 
            width: `${Math.min(progress, 100)}%`,
            background: `linear-gradient(90deg, ${goal.color} 0%, ${goal.color}80 100%)`
          }}
        />
      </div>
      <div className="flex justify-between items-center text-xs text-gray-400">
        <span>{progress.toFixed(0)}% завершено</span>
        <span>Осталось: {((goal.target || 0) - (goal.current || 0)).toLocaleString('ru-RU')} zł</span>
      </div>
    </div>
  );
};

// Простой график (пока не используется)
// const SimpleChart = ({ data, title }) => {
//   const maxValue = Math.max(...data.map(d => d.value));
//   
//   return (
//     <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
//       <h4 className="text-lg font-semibold text-white mb-4">{title}</h4>
//       <div className="space-y-3">
//         {data.map((item, index) => (
//           <div key={index} className="flex items-center gap-3">
//             <div className="w-20 text-sm text-gray-300 text-right">{item.name}</div>
//             <div className="flex-1 bg-gray-700 rounded-full h-4 relative">
//               <div
//                 className="h-4 rounded-full transition-all duration-500"
//                 style={{
//                   width: `${(item.value / maxValue) * 100}%`,
//                   backgroundColor: item.color || '#3b82f6'
//                 }}
//               />
//               <span className="absolute right-2 top-0 h-4 flex items-center text-xs text-white font-medium">
//                 {item.value.toLocaleString('ru-RU')} zł
//               </span>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// Круговая диаграмма (упрощенная)
const PieChart = ({ data, title, formatCurrency }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
      <h4 className="text-lg font-semibold text-white mb-4">{title}</h4>
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = total > 0 ? (item.value / total * 100) : 0;
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-gray-300">{item.name}</span>
              </div>
              <div className="text-right">
                <div className="text-white font-medium">
                  {formatCurrency ? formatCurrency(item.value || 0) : `${(item.value || 0).toLocaleString('ru-RU')} zł`}
                </div>
                <div className="text-xs text-gray-400">{percentage.toFixed(1)}%</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// График тенденций (по месяцам)
const TrendChart = ({ transactions, formatCurrency, title = "Тенденции расходов" }) => {
  // Группируем транзакции по месяцам
  const monthlyData = {};
  
  transactions.forEach(transaction => {
    if (transaction.type === 'expense') {
      const month = transaction.date.toLocaleDateString('ru-RU', { 
        year: 'numeric', 
        month: 'long' 
      });
      monthlyData[month] = (monthlyData[month] || 0) + transaction.amount;
    }
  });

  const chartData = Object.entries(monthlyData)
    .map(([month, amount]) => ({ name: month, value: amount }))
    .slice(-6); // Последние 6 месяцев

  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
      <h4 className="text-lg font-semibold text-white mb-4">{title}</h4>
      <div className="space-y-3">
        {chartData.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="w-24 text-sm text-gray-300 text-right">{item.name}</div>
            <div className="flex-1 bg-gray-700 rounded-full h-4 relative">
              <div
                className="h-4 rounded-full transition-all duration-500 bg-gradient-to-r from-red-500 to-red-400"
                style={{
                  width: `${(item.value / maxValue) * 100}%`
                }}
              />
              <span className="absolute right-2 top-0 h-4 flex items-center text-xs text-white font-medium">
                {formatCurrency ? formatCurrency(item.value || 0) : `${(item.value || 0).toLocaleString('ru-RU')} zł`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Главный компонент приложения
function App() {
  // Проверка версии приложения
  console.log('🚀 Budget App v2.2.5 - FIXED toLocaleString errors!');
  
  // Firebase hook для проверки подключения
  const { isConnected: firebaseConnected, error: firebaseError, isEnabled: firebaseEnabled } = useFirebase();
  
  // Безопасная функция для фильтрации транзакций
  const safeFilterTransactions = (transactions, filterFn) => {
    return Array.isArray(transactions) ? transactions.filter(filterFn) : [];
  };
  
  // Функции для работы с localStorage
  const saveToLocalStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Ошибка сохранения в localStorage:', error);
    }
  };

  const loadFromLocalStorage = (key, defaultValue) => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Восстанавливаем даты для транзакций
        if (key === 'familyBudget_transactions' && Array.isArray(parsed)) {
          return parsed.map(t => ({
            ...t,
            date: new Date(t.date)
          }));
        }
        return parsed;
      }
    } catch (error) {
      console.error('Ошибка загрузки из localStorage:', error);
    }
    return defaultValue;
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState(() => loadFromLocalStorage('familyBudget_theme', 'dark'));
  const [notification, setNotification] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [selectedUser, setSelectedUser] = useState('');

  // Состояние данных с загрузкой из localStorage
  const [balances, setBalances] = useState(() => 
    loadFromLocalStorage('familyBudget_balances', {
      arthur: 2450,
      valeria: 1890,
      shared: 5670
    })
  );

  const [transactions, setTransactions] = useState(() =>
    loadFromLocalStorage('familyBudget_transactions', [
      { id: 1, user: 'arthur', type: 'income', amount: 3000, description: 'Зарплата', category: 'Работа', date: new Date() },
      { id: 2, user: 'valeria', type: 'income', amount: 2500, description: 'Зарплата', category: 'Работа', date: new Date() },
      { id: 3, user: 'shared', type: 'expense', amount: 890, description: 'Продукты', category: 'Продукты', date: new Date() },
      { id: 4, user: 'arthur', type: 'expense', amount: 320, description: 'Метро', category: 'Транспорт', date: new Date() },
      { id: 5, user: 'valeria', type: 'expense', amount: 280, description: 'Кино', category: 'Развлечения', date: new Date() }
    ])
  );

  const [goals, setGoals] = useState(() =>
    loadFromLocalStorage('familyBudget_goals', [
      { 
        id: 1, 
        title: 'Отпуск в Италию', 
        current: 3200, 
        target: 8000, 
        color: '#10b981',
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 3 месяца
      },
      { 
        id: 2, 
        title: 'Новый ноутбук', 
        current: 1500, 
        target: 4000, 
        color: '#3b82f6',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 2 месяца
      },
      { 
        id: 3, 
        title: 'Ремонт кухни', 
        current: 850, 
        target: 15000, 
        color: '#f59e0b',
        deadline: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 1 год
      }
    ])
  );

  const [categories, setCategories] = useState(() =>
    loadFromLocalStorage('familyBudget_categories', [
      { id: 1, name: 'Продукты', limit: 1200, color: '#ef4444' },
      { id: 2, name: 'Транспорт', limit: 500, color: '#3b82f6' },
      { id: 3, name: 'Развлечения', limit: 600, color: '#8b5cf6' },
      { id: 4, name: 'Коммунальные', limit: 600, color: '#f59e0b' },
      { id: 5, name: 'Работа', limit: 0, color: '#10b981' }
    ])
  );

  const [exchangeRates, setExchangeRates] = useState(() =>
    loadFromLocalStorage('familyBudget_exchangeRates', {
      EUR: 4.65,
      USD: 4.28,
      UAH: 0.103,
      PLN: 1.00
    })
  );
  const [lastRateUpdate, setLastRateUpdate] = useState(null);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [familyCode, setFamilyCode] = useState(() => loadFromLocalStorage('familyCode', null));
  const [isConnectedToFamily, setIsConnectedToFamily] = useState(() => loadFromLocalStorage('isConnectedToFamily', false));
  const [userName, setUserName] = useState(() => loadFromLocalStorage('userName', ''));
  const [familyId, setFamilyId] = useState(() => {
    const id = loadFromLocalStorage('familyId', null);
    console.log('🔍 Инициализация familyId:', id);
    return id;
  });
  const [syncMode, setSyncMode] = useState(() => {
    const mode = loadFromLocalStorage('syncMode', 'local');
    console.log('🔍 Инициализация syncMode:', mode);
    return mode;
  });

  const [selectedCurrency, setSelectedCurrency] = useState('PLN');

  // Автоматическое сохранение данных в localStorage
  useEffect(() => {
    saveToLocalStorage('familyBudget_theme', theme);
  }, [theme]);

  useEffect(() => {
    saveToLocalStorage('familyBudget_balances', balances);
  }, [balances]);

  useEffect(() => {
    saveToLocalStorage('familyBudget_transactions', transactions);
  }, [transactions]);

  useEffect(() => {
    saveToLocalStorage('familyBudget_goals', goals);
  }, [goals]);

  useEffect(() => {
    saveToLocalStorage('familyBudget_categories', categories);
  }, [categories]);

  useEffect(() => {
    saveToLocalStorage('familyBudget_exchangeRates', exchangeRates);
  }, [exchangeRates]);

  useEffect(() => {
    console.log('📝 familyId изменился:', familyId);
    saveToLocalStorage('familyId', familyId);
  }, [familyId]);

  useEffect(() => {
    console.log('📝 syncMode изменился:', syncMode);
    saveToLocalStorage('syncMode', syncMode);
  }, [syncMode]);

  // PWA установка
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallPrompt(true);
    };

    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      showNotification('Приложение установлено! 🎉', 'success');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Firebase подписки для синхронизации данных
  useEffect(() => {
    console.log('🔍 Проверка условий Firebase подписок:', {
      familyId: familyId,
      syncMode: syncMode,
      condition: !familyId || (syncMode !== 'cloud' && syncMode !== 'firebase'),
      shouldReturn: !familyId || (syncMode !== 'cloud' && syncMode !== 'firebase')
    });
    
    if (!familyId || (syncMode !== 'cloud' && syncMode !== 'firebase')) {
      console.log('❌ Firebase подписки НЕ активированы:', { familyId, syncMode });
      return;
    }
    
    console.log('✅ Активируем Firebase подписки для familyId:', familyId);

    const unsubscribeTransactions = subscribeToTransactions(familyId, (result) => {
      console.log('Получены новые транзакции из Firebase:', result);
      // Проверяем что result содержит транзакции
      if (result.success && Array.isArray(result.transactions)) {
        setTransactions(result.transactions);
        console.log('🔄 Транзакции обновлены в реальном времени!', result.transactions.length);
      } else {
        console.warn('Транзакции из Firebase не содержат данные:', result);
        setTransactions([]);
      }
    });

    const unsubscribeGoals = subscribeToGoals(familyId, (result) => {
      console.log('Получены новые цели из Firebase:', result);
      if (result.success && Array.isArray(result.goals)) {
        setGoals(result.goals);
        console.log('🎯 Цели обновлены в реальном времени!', result.goals.length);
      } else {
        console.warn('Цели из Firebase не содержат данные:', result);
        setGoals([]);
      }
    });

    const unsubscribeFamilyData = subscribeToFamilyData(familyId, (result) => {
      console.log('Получены данные семьи из Firebase:', result);
      if (result.success && result.family) {
        console.log('🔄 Данные семьи:', result.family);
        if (result.family.balances) {
          console.log('💰 Обновляем баланс из Firebase:', result.family.balances);
          setBalances(result.family.balances);
        }
      } else {
        console.warn('Данные семьи из Firebase некорректны:', result);
      }
    });

    return () => {
      unsubscribeTransactions?.();
      unsubscribeGoals?.();
      unsubscribeFamilyData?.();
    };
  }, [familyId, syncMode]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      showNotification('Приложение устанавливается...', 'success');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  // Генерация уникального кода семьи
  const generateFamilyCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Создание новой семьи
  const createFamily = async (name) => {
    const newFamilyCode = generateFamilyCode();
    console.log('🚀 Создание семьи:', { newFamilyCode, name });
    
    try {
      // Создаем семью в Firebase
      console.log('📡 Отправляем запрос в Firebase...');
      const result = await createFamilyFirestore(newFamilyCode, name, name);
      console.log('📋 Результат от Firebase:', result);
      
      if (result.success) {
        setFamilyCode(newFamilyCode);
        setFamilyId(newFamilyCode); // Используем familyCode как ID
        setUserName(name);
        setIsConnectedToFamily(true);
        setSyncMode('firebase');
        
        saveToLocalStorage('familyCode', newFamilyCode);
        saveToLocalStorage('familyId', newFamilyCode);
        saveToLocalStorage('userName', name);
        saveToLocalStorage('isConnectedToFamily', true);
        saveToLocalStorage('syncMode', 'firebase');
        
        console.log('✅ Семья создана успешно!', { familyCode: newFamilyCode, familyId: newFamilyCode, syncMode: 'firebase' });
        showNotification(`Семья создана в Firebase! Код: ${newFamilyCode}`, 'success');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Ошибка создания семьи в Firebase:', error);
      // Откат к локальному режиму
      setFamilyCode(newFamilyCode);
      setUserName(name);
      setIsConnectedToFamily(true);
      saveToLocalStorage('familyCode', newFamilyCode);
      saveToLocalStorage('userName', name);
      saveToLocalStorage('isConnectedToFamily', true);
      showNotification(`Семья создана локально! Код: ${newFamilyCode}`, 'warning');
    }
  };

  // Подключение к существующей семье
  const joinFamily = async (code, name) => {
    try {
      // Подключаемся к семье в Firebase
      const result = await joinFamilyFirestore(code.toUpperCase(), name);
      
      if (result.success) {
        setFamilyCode(code.toUpperCase());
        setFamilyId(code.toUpperCase()); // Используем familyCode как ID
        setUserName(name);
        setIsConnectedToFamily(true);
        setSyncMode('firebase');
        
        // Синхронизируем данные из Firebase
        if (result.family.balances) {
          setBalances(result.family.balances);
        }
        
        saveToLocalStorage('familyCode', code.toUpperCase());
        saveToLocalStorage('familyId', code.toUpperCase());
        saveToLocalStorage('userName', name);
        saveToLocalStorage('isConnectedToFamily', true);
        saveToLocalStorage('syncMode', 'firebase');
        
        showNotification(`Подключение к семье ${code.toUpperCase()} успешно!`, 'success');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Ошибка подключения к семье в Firebase:', error);
      // Откат к локальному режиму
      setFamilyCode(code.toUpperCase());
      setUserName(name);
      setIsConnectedToFamily(true);
      saveToLocalStorage('familyCode', code.toUpperCase());
      saveToLocalStorage('userName', name);
      saveToLocalStorage('isConnectedToFamily', true);
      showNotification(`Подключение к семье ${code.toUpperCase()} (локально)`, 'warning');
    }
  };

  // Отключение от семьи
  const disconnectFamily = () => {
    setFamilyCode(null);
    setFamilyId(null);
    setUserName('');
    setIsConnectedToFamily(false);
    setSyncMode('local');
    saveToLocalStorage('familyCode', null);
    saveToLocalStorage('familyId', null);
    saveToLocalStorage('userName', '');
    saveToLocalStorage('isConnectedToFamily', false);
    saveToLocalStorage('syncMode', 'local');
    showNotification('Отключен от семьи', 'success');
  };

  // const currencySymbols = {
  //   PLN: 'zł',
  //   EUR: '€',
  //   USD: '$',
  //   UAH: '₴'
  // };

  // const convertAmount = (amount, toCurrency = selectedCurrency) => {
  //   if (toCurrency === 'PLN') return amount;
  //   return amount / exchangeRates[toCurrency];
  // };

  const formatCurrency = useCallback((amount, currency = selectedCurrency) => {
    const convertedAmount = currency === 'PLN' ? amount : amount / exchangeRates[currency];
    const symbols = { PLN: 'zł', EUR: '€', USD: '$', UAH: '₴' };
    return `${convertedAmount.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} ${symbols[currency]}`;
  }, [selectedCurrency, exchangeRates]);

  // Функция для получения классов тем (пока не используется)
  // const getThemeClasses = () => ({
  //   cardBg: theme === 'light' 
  //     ? 'bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200' 
  //     : 'bg-gray-800/50 backdrop-blur-sm',
  //   text: theme === 'light' ? 'text-gray-800' : 'text-white',
  //   textSecondary: theme === 'light' ? 'text-gray-600' : 'text-gray-300',
  //   textMuted: theme === 'light' ? 'text-gray-500' : 'text-gray-400',
  //   input: theme === 'light' 
  //     ? 'bg-gray-50 border border-gray-300 text-gray-800' 
  //     : 'bg-gray-700 text-white',
  //   button: theme === 'light'
  //     ? 'bg-blue-500 hover:bg-blue-600 text-white'
  //     : 'bg-blue-600 hover:bg-blue-700 text-white'
  // });

  // const themeClasses = getThemeClasses();

  // Функция для получения актуальных курсов валют
  const fetchExchangeRates = async () => {
    setIsLoadingRates(true);
    try {
      // Используем бесплатный API exchangerate-api.com
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/PLN');
      const data = await response.json();
      
      // Конвертируем курсы в формат PLN к другим валютам
      const newRates = {
        PLN: 1.00,
        EUR: 1 / data.rates.EUR, // Сколько PLN за 1 EUR
        USD: 1 / data.rates.USD, // Сколько PLN за 1 USD  
        UAH: 1 / data.rates.UAH  // Сколько PLN за 1 UAH
      };
      
      setExchangeRates(newRates);
      setLastRateUpdate(new Date());
      showNotification('Курсы валют обновлены!', 'success');
    } catch (error) {
      console.error('Ошибка получения курсов валют:', error);
      showNotification('Не удалось обновить курсы валют', 'error');
    }
    setIsLoadingRates(false);
  };

  // Автоматическое обновление курсов при загрузке приложения
  useEffect(() => {
    const loadRates = async () => {
      setIsLoadingRates(true);
      try {
        // Используем бесплатный API exchangerate-api.com
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/PLN');
        const data = await response.json();
        
        // Конвертируем курсы в формат PLN к другим валютам
        const newRates = {
          PLN: 1.00,
          EUR: 1 / data.rates.EUR, // Сколько PLN за 1 EUR
          USD: 1 / data.rates.USD, // Сколько PLN за 1 USD  
          UAH: 1 / data.rates.UAH  // Сколько PLN за 1 UAH
        };
        
        setExchangeRates(newRates);
        setLastRateUpdate(new Date());
        showNotification('Курсы валют обновлены!', 'success');
      } catch (error) {
        console.error('Ошибка получения курсов валют:', error);
        showNotification('Не удалось обновить курсы валют', 'error');
      }
      setIsLoadingRates(false);
    };
    
    loadRates();
  }, []);

  // Умная система уведомлений о лимитах
  useEffect(() => {
    const checkLimitsAndNotify = () => {
      const currentDate = new Date();
      const monthKey = `${currentDate.getFullYear()}-${currentDate.getMonth()}`;
      const lastCheck = localStorage.getItem(`lastLimitCheck_${monthKey}`);
      const now = currentDate.toISOString();
      
      // Проверяем каждый час
      if (lastCheck && (new Date(now) - new Date(lastCheck)) < 3600000) {
        return;
      }

      categories.forEach(category => {
        if (category.limit === 0) return;
        
        // Траты в этом месяце
        const monthlySpent = transactions
          .filter(t => {
            const tDate = new Date(t.date);
            return t.category === category.name && 
                   t.type === 'expense' &&
                   tDate.getMonth() === currentDate.getMonth() &&
                   tDate.getFullYear() === currentDate.getFullYear();
          })
          .reduce((sum, t) => sum + t.amount, 0);

        const percentage = (monthlySpent / category.limit) * 100;
        
        // Умные уведомления с разными уровнями
        if (percentage >= 100) {
          showNotification(
            `🚨 Лимит "${category.name}" превышен на ${(percentage - 100).toFixed(1)}%! (${formatCurrency(monthlySpent)} из ${formatCurrency(category.limit)})`,
            'error'
          );
        } else if (percentage >= 90) {
          showNotification(
            `⚠️ Почти превышен лимит "${category.name}": ${percentage.toFixed(1)}% (осталось ${formatCurrency(category.limit - monthlySpent)})`,
            'warning'
          );
        } else if (percentage >= 75) {
          showNotification(
            `📊 Использовано ${percentage.toFixed(1)}% лимита "${category.name}" (осталось ${formatCurrency(category.limit - monthlySpent)})`,
            'warning'
          );
        }
      });

      // Проверяем приближающиеся дедлайны целей
      goals.forEach(goal => {
        if (!goal.deadline) return;
        
        const deadline = new Date(goal.deadline);
        const daysLeft = Math.ceil((deadline - currentDate) / (1000 * 60 * 60 * 24));
        const progress = (goal.current / goal.target) * 100;
        
        if (daysLeft <= 7 && daysLeft > 0 && progress < 80) {
          showNotification(
            `🎯 Цель "${goal.title}" истекает через ${daysLeft} дн. Прогресс: ${progress.toFixed(1)}%`,
            'warning'
          );
        } else if (daysLeft <= 0 && progress < 100) {
          showNotification(
            `⏰ Дедлайн цели "${goal.title}" истёк! Достигнуто: ${progress.toFixed(1)}%`,
            'error'
          );
        }
      });

      // Прогноз расходов
      const monthlyExpenses = transactions
        .filter(t => {
          const tDate = new Date(t.date);
          return t.type === 'expense' &&
                 tDate.getMonth() === currentDate.getMonth() &&
                 tDate.getFullYear() === currentDate.getFullYear();
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const dayOfMonth = currentDate.getDate();
      const totalDaysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
      const projectedMonthlyExpenses = (monthlyExpenses / dayOfMonth) * totalDaysInMonth;
      
      const totalBalance = Object.values(balances).reduce((sum, balance) => sum + balance, 0);
      
      if (projectedMonthlyExpenses > totalBalance && dayOfMonth > 15) {
        showNotification(
          `💸 Прогноз: траты в этом месяце могут превысить баланс на ${formatCurrency(projectedMonthlyExpenses - totalBalance)}`,
          'error'
        );
      }

      localStorage.setItem(`lastLimitCheck_${monthKey}`, now);
    };

    // Проверяем при загрузке и изменении данных
    checkLimitsAndNotify();
  }, [transactions, categories, goals, balances, formatCurrency]);

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
    showNotification(`Тема переключена на ${theme === 'dark' ? 'светлую' : 'тёмную'}`, 'success');
  };

  const balanceData = {
    arthur: { balance: balances.arthur, color: '#8b5cf6', icon: '💜' },
    valeria: { balance: balances.valeria, color: '#ec4899', icon: '💖' },
    shared: { balance: balances.shared, color: '#f59e0b', icon: '🧡' }
  };

  const getUserTransactions = (user) => Array.isArray(transactions) ? transactions.filter(t => t.user === user) : [];

  // Функции для работы с данными
  const addTransaction = async (formData) => {
    const amount = parseFloat(formData.get('amount'));
    const description = formData.get('description') || formData.get('category');
    const newTransaction = {
      id: Date.now(),
      user: formData.get('user'),
      type: formData.get('type'),
      amount: amount,
      description: description,
      category: formData.get('category'),
      date: new Date()
    };
    
    // Если семья подключена, сохраняем в Firebase
    console.log('Проверка условий Firebase:', { familyId, syncMode, condition: familyId && (syncMode === 'cloud' || syncMode === 'firebase') });
    if (familyId && (syncMode === 'cloud' || syncMode === 'firebase')) {
      try {
        console.log('Отправляем транзакцию в Firebase:', { familyId, newTransaction });
        await addTransactionFirestore(familyId, newTransaction);
        console.log('✅ Транзакция сохранена в Firebase');
      } catch (error) {
        console.error('❌ Ошибка сохранения в Firebase:', error);
        // В случае ошибки сохраняем локально
        setTransactions(prev => [...prev, newTransaction]);
      }
    } else {
      console.log('💾 Сохраняем локально (Firebase не активен)');
      // Сохраняем локально
      setTransactions(prev => [...prev, newTransaction]);
    }
    
    // Обновляем баланс локально (Firebase будет синхронизировать автоматически)
    if (newTransaction.type === 'income') {
      setBalances(prev => ({
        ...prev,
        [newTransaction.user]: prev[newTransaction.user] + amount
      }));
    } else {
      setBalances(prev => ({
        ...prev,
        [newTransaction.user]: prev[newTransaction.user] - amount
      }));
    }
    
    // Если семья подключена, обновляем баланс в Firebase
    if (familyId && (syncMode === 'cloud' || syncMode === 'firebase')) {
      try {
        const newBalance = newTransaction.type === 'income' 
          ? balances[newTransaction.user] + amount 
          : balances[newTransaction.user] - amount;
        
        const updatedBalances = {
          ...balances,
          [newTransaction.user]: newBalance
        };
        
        console.log('💰 Обновляем баланс в Firebase:', {
          user: newTransaction.user,
          oldBalance: balances[newTransaction.user],
          amount: amount,
          type: newTransaction.type,
          newBalance: newBalance,
          fullBalances: updatedBalances
        });
        
        const result = await updateFamilyBalances(familyId, updatedBalances);
        
        console.log('✅ Результат обновления баланса в Firebase:', result);
      } catch (error) {
        console.error('❌ Ошибка обновления баланса в Firebase:', error);
      }
    }
    
    showNotification('Операция добавлена!', 'success');
    setModalOpen(false);
    setSelectedUser('');
  };

  const deleteTransaction = (transactionId) => {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;
    
    // Подтверждение удаления
    if (!confirm(`Удалить операцию "${transaction.description}" на сумму ${transaction.amount} zł?`)) {
      return;
    }
    
    // Обновляем баланс (возвращаем деньги)
    if (transaction.type === 'income') {
      setBalances(prev => ({
        ...prev,
        [transaction.user]: prev[transaction.user] - transaction.amount
      }));
    } else {
      setBalances(prev => ({
        ...prev,
        [transaction.user]: prev[transaction.user] + transaction.amount
      }));
    }
    
    // Удаляем операцию
    setTransactions(prev => prev.filter(t => t.id !== transactionId));
    showNotification('Операция удалена!', 'success');
  };

  const addGoal = (formData) => {
    const newGoal = {
      id: Date.now(),
      title: formData.get('title'),
      target: parseFloat(formData.get('target')),
      current: 0,
      color: '#3b82f6',
      deadline: formData.get('deadline') || null
    };
    setGoals(prev => [...prev, newGoal]);
    showNotification('Цель добавлена!', 'success');
    setModalOpen(false);
    setSelectedUser('');
  };

  const addMoneyToGoal = (goalId, amount) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId 
        ? { ...goal, current: Math.min(goal.current + amount, goal.target) }
        : goal
    ));
    showNotification('Деньги добавлены к цели!', 'success');
    setModalOpen(false);
    setSelectedUser('');
  };

  const deleteGoal = (goalId) => {
    setGoals(prev => prev.filter(g => g.id !== goalId));
    showNotification('Цель удалена!', 'success');
  };

  const editCategoryLimit = (categoryId, newLimit) => {
    setCategories(prev => prev.map(cat => 
      cat.id === categoryId 
        ? { ...cat, limit: parseFloat(newLimit) || 0 }
        : cat
    ));
    showNotification('Лимит категории обновлён!', 'success');
    setModalOpen(false);
    setSelectedUser('');
  };

  const addCategory = (formData) => {
    const colors = ['#ef4444', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#06b6d4'];
    const newCategory = {
      id: Date.now(),
      name: formData.get('name'),
      limit: parseFloat(formData.get('limit')) || 0,
      color: colors[Math.floor(Math.random() * colors.length)]
    };
    setCategories(prev => [...prev, newCategory]);
    showNotification('Категория добавлена!', 'success');
    setModalOpen(false);
    setSelectedUser('');
  };

  // Получение данных для аналитики
  const getAnalyticsData = () => {
    const expensesByCategory = categories.map(category => {
      const spent = transactions
        .filter(t => t.category === category.name && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        name: category.name,
        value: spent,
        color: category.color
      };
    }).filter(item => item.value > 0);

    const incomeByUser = [
      { 
        name: 'Артур', 
        value: Array.isArray(transactions) ? transactions.filter(t => t.user === 'arthur' && t.type === 'income').reduce((sum, t) => sum + t.amount, 0) : 0, 
        color: '#8b5cf6' 
      },
      { 
        name: 'Валерия', 
        value: Array.isArray(transactions) ? transactions.filter(t => t.user === 'valeria' && t.type === 'income').reduce((sum, t) => sum + t.amount, 0) : 0, 
        color: '#ec4899' 
      }
    ].filter(item => item.value > 0);

    return { expensesByCategory, incomeByUser };
  };

  // Рендеринг контента по вкладкам
  const renderContent = () => {
    const { expensesByCategory, incomeByUser } = getAnalyticsData();

    switch (activeTab) {
      case 'transactions':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 sm:justify-between sm:items-center">
              <h2 className="text-3xl font-bold text-white">💳 Операции</h2>
              <button
                onClick={() => setModalOpen(true) || setModalType('transaction')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors text-center"
              >
                ➕ Добавить операцию
              </button>
            </div>
            
            <div className="space-y-3">
              {transactions.slice(-10).reverse().map(transaction => (
                <div key={transaction.id} className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl">
                  {/* Мобильная версия - вертикальная компоновка */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">{transaction.description || 'Без описания'}</div>
                      <div className="text-sm text-gray-400 mt-1">
                        <span className="inline-block">{transaction.user}</span>
                        <span className="mx-2 hidden sm:inline">•</span>
                        <span className="block sm:inline">{transaction.category}</span>
                        <span className="mx-2 hidden sm:inline">•</span>
                        <span className="block sm:inline text-xs sm:text-sm">{transaction.date.toLocaleDateString('ru-RU')}</span>
                      </div>
                    </div>
                    <div className="flex justify-between sm:justify-end items-center gap-4">
                      <div className={`text-xl sm:text-lg font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </div>
                      <button
                        onClick={() => deleteTransaction(transaction.id)}
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-900/20 transition-colors"
                        title="Удалить операцию"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {transactions.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <div className="text-4xl mb-4">💭</div>
                  <div>Пока операций нет</div>
                  <div className="text-sm mt-2">Добавьте первую операцию!</div>
                </div>
              )}
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-white">🎯 Наши цели</h2>
              <button
                onClick={() => setModalOpen(true) || setModalType('goal')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                ➕ Добавить цель
              </button>
            </div>
            <div className="grid gap-6">
              {goals.map(goal => (
                <GoalCard 
                  key={goal.id} 
                  goal={goal}
                  onEdit={(goal) => setEditingItem(goal) || setModalType('editGoal') || setModalOpen(true)}
                  onDelete={deleteGoal}
                  onAddMoney={(goal) => setEditingItem(goal) || setModalType('addMoney') || setModalOpen(true)}
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>
          </div>
        );

      case 'categories':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-white">📂 Категории и лимиты</h2>
              <button
                onClick={() => {setEditingItem(null); setModalType('addCategory'); setModalOpen(true);}}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <span>➕</span>
                <span>Добавить категорию</span>
              </button>
            </div>
            <div className="grid gap-4">
              {categories.map(category => {
                const spent = transactions
                  .filter(t => t.category === category.name && t.type === 'expense')
                  .reduce((sum, t) => sum + t.amount, 0);
                const progress = category.limit > 0 ? (spent / category.limit) * 100 : 0;
                
                return (
                  <div key={category.id} className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-lg font-semibold text-white">{category.name}</h4>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-300">
                          {(spent || 0).toLocaleString('ru-RU')} / {(category.limit || 0) > 0 ? (category.limit || 0).toLocaleString('ru-RU') : '∞'} zł
                        </span>
                        <button
                          onClick={() => {setEditingItem(category); setModalType('editLimit'); setModalOpen(true);}}
                          className="text-blue-400 hover:text-blue-300 text-sm p-1"
                          title="Редактировать лимит"
                        >
                          ✏️
                        </button>
                      </div>
                    </div>
                    {category.limit > 0 && (
                      <>
                        <div className="w-full bg-gray-700 rounded-full h-2 mb-1">
                          <div 
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${Math.min(progress, 100)}%`,
                              backgroundColor: progress > 100 ? '#ef4444' : category.color
                            }}
                          />
                        </div>
                        <div className="text-xs text-gray-400 text-right">
                          {progress.toFixed(0)}% использовано
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">📊 Расширенная аналитика</h2>
            
            {/* Первый ряд - курсы валют и общая статистика */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-white">💰 Курсы валют</h4>
                  <button
                    onClick={fetchExchangeRates}
                    disabled={isLoadingRates}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-3 py-1 rounded text-sm transition-colors"
                    title="Обновить курсы"
                  >
                    {isLoadingRates ? '⏳' : '🔄'}
                  </button>
                </div>
                <div className="space-y-2">
                  {Object.entries(exchangeRates).map(([currency, rate]) => (
                    <div key={currency} className="flex justify-between text-gray-300">
                      <span>1 {currency}</span>
                      <span>{rate.toFixed(4)} PLN</span>
                    </div>
                  ))}
                </div>
                {lastRateUpdate && (
                  <div className="text-xs text-gray-500 mt-3">
                    Обновлено: {lastRateUpdate.toLocaleString('ru-RU')}
                  </div>
                )}
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
                <h4 className="text-lg font-semibold text-white mb-4">📈 Общая статистика</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Общий доход:</span>
                    <span className="text-green-400 font-bold">
                      +{formatCurrency(transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Общие расходы:</span>
                    <span className="text-red-400 font-bold">
                      -{formatCurrency(transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-600 pt-2">
                    <span className="text-gray-300">Общий баланс:</span>
                    <span className="text-white font-bold">
                      {formatCurrency(Object.values(balances).reduce((sum, balance) => sum + balance, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Средний расход/день:</span>
                    <span className="text-yellow-400 font-bold">
                      {formatCurrency(
                        transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0) / 
                        Math.max(1, Math.ceil((new Date() - new Date(Math.min(...transactions.map(t => t.date)))) / (1000 * 60 * 60 * 24)))
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Второй ряд - круговые диаграммы */}
            <div className="grid md:grid-cols-2 gap-6">
              {expensesByCategory.length > 0 && (
                <PieChart 
                  data={expensesByCategory} 
                  title="📊 Расходы по категориям" 
                  formatCurrency={formatCurrency}
                />
              )}
              {incomeByUser.length > 0 && (
                <PieChart 
                  data={incomeByUser} 
                  title="👥 Доходы по пользователям" 
                  formatCurrency={formatCurrency}
                />
              )}
            </div>

            {/* Третий ряд - тенденции и прогнозы */}
            <div className="grid md:grid-cols-2 gap-6">
              <TrendChart 
                transactions={transactions} 
                formatCurrency={formatCurrency}
                title="📈 Тенденции расходов по месяцам"
              />
              
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
                <h4 className="text-lg font-semibold text-white mb-4">🔮 Прогнозы</h4>
                <div className="space-y-4">
                  {(() => {
                    const monthlyExpenses = transactions
                      .filter(t => t.type === 'expense')
                      .reduce((sum, t) => sum + t.amount, 0) / Math.max(1, new Set(transactions.map(t => `${t.date.getFullYear()}-${t.date.getMonth()}`)).size);
                    const totalBalance = Object.values(balances).reduce((sum, balance) => sum + balance, 0);
                    const monthsLeft = totalBalance / Math.max(monthlyExpenses, 1);
                    
                    return (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Средний расход/месяц:</span>
                          <span className="text-orange-400 font-bold">
                            {formatCurrency(monthlyExpenses)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Денег хватит на:</span>
                          <span className="text-cyan-400 font-bold">
                            {monthsLeft > 12 ? '12+ месяцев' : `${monthsLeft.toFixed(1)} месяцев`}
                          </span>
                        </div>
                        <div className="bg-gray-700 rounded-lg p-3 mt-4">
                          <div className="text-xs text-gray-400 mb-1">Прогноз на следующий месяц</div>
                          <div className="text-white">
                            Ожидаемые расходы: {formatCurrency(monthlyExpenses)}
                          </div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white">⚙️ Настройки</h2>
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
              <div className="space-y-6">
                <div>
                  <label className="block text-white mb-2 font-medium">Тема приложения</label>
                  <button
                    onClick={toggleTheme}
                    className="bg-gray-700 hover:bg-gray-600 text-white p-3 rounded-lg w-full text-left transition-colors"
                  >
                    {theme === 'dark' ? '🌙 Тёмная тема' : '☀️ Светлая тема'}
                  </button>
                </div>
                
                <div>
                  <label className="block text-white mb-2 font-medium">Основная валюта</label>
                  <select 
                    value={selectedCurrency}
                    onChange={(e) => setSelectedCurrency(e.target.value)}
                    className="bg-gray-700 text-white p-3 rounded-lg w-full"
                  >
                    <option value="PLN">Polish Złoty (zł)</option>
                    <option value="EUR">Euro (€)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="UAH">Ukrainian Hryvnia (₴)</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-600">
                  <h4 className="text-white font-medium mb-3">👥 Информация о семье</h4>
                  <div className="space-y-3">
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Код семьи:</span>
                        <span className="font-mono text-white">{familyCode}</span>
                      </div>
                    </div>
                    <div className="bg-gray-700/50 p-3 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Ваше имя:</span>
                        <span className="text-white">{userName}</span>
                      </div>
                    </div>
                    <button
                      onClick={disconnectFamily}
                      className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg w-full transition-colors"
                    >
                      🚪 Отключиться от семьи
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-600">
                  <SyncModeSelector 
                    currentMode={syncMode}
                    onModeChange={(mode) => {
                      console.log('Режим синхронизации изменен на:', mode);
                      setSyncMode(mode);
                      if (mode === 'cloud') {
                        if (firebaseConnected) {
                          showNotification('🔥 Переключено на Firebase! Облачная синхронизация активна.', 'success');
                        } else if (firebaseError) {
                          showNotification(`❌ Ошибка Firebase: ${firebaseError}`, 'error');
                        } else {
                          showNotification('⚠️ Firebase включен, но подключение не проверено', 'warning');
                        }
                      } else {
                        showNotification('📱 Переключено на локальный режим', 'success');
                      }
                    }}
                  />
                </div>

                {showInstallPrompt && (
                  <div className="pt-4 border-t border-gray-600">
                    <label className="block text-white mb-2 font-medium">Установка приложения</label>
                    <button
                      onClick={handleInstallClick}
                      className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg w-full text-left transition-colors flex items-center gap-3"
                    >
                      <span>📱</span>
                      <div>
                        <div>Установить как приложение</div>
                        <div className="text-xs text-green-200">Работает без интернета, быстрый доступ</div>
                      </div>
                    </button>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-600">
                  <h4 className="text-white font-medium mb-3">Информация о приложении</h4>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>Версия: 2.2.0 🔥 Real-time Firebase</p>
                    <p>Последнее обновление: 6 октября 2025</p>
                    <p>Функции: PWA готов, все основные возможности</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default: // dashboard
        return (
          <div className="space-y-8">
            <h1 className={`text-4xl font-bold text-center mb-8 ${theme === 'light' ? 'text-gray-800' : 'text-white'}`}>
              💰 Семейный бюджет
            </h1>
            
            <div className="grid md:grid-cols-3 gap-6">
              <BalanceCard 
                user="Артур" 
                balance={balanceData.arthur.balance}
                color={balanceData.arthur.color}
                icon={balanceData.arthur.icon}
                transactions={getUserTransactions('arthur')}
                formatCurrency={formatCurrency}
                onEdit={() => {setSelectedUser('arthur'); setModalOpen(true); setModalType('transaction');}}
              />
              <BalanceCard 
                user="Валерия" 
                balance={balanceData.valeria.balance}
                color={balanceData.valeria.color}
                icon={balanceData.valeria.icon}
                transactions={getUserTransactions('valeria')}
                formatCurrency={formatCurrency}
                onEdit={() => {setSelectedUser('valeria'); setModalOpen(true); setModalType('transaction');}}
              />
              <BalanceCard 
                user="Общий бюджет" 
                balance={balanceData.shared.balance}
                color={balanceData.shared.color}
                icon={balanceData.shared.icon}
                transactions={getUserTransactions('shared')}
                formatCurrency={formatCurrency}
                onEdit={() => {setSelectedUser('shared'); setModalOpen(true); setModalType('transaction');}}
              />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-green-400">
                  +{formatCurrency(transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0))}
                </div>
                <div className="text-sm text-gray-300">Доходы в месяце</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-red-400">
                  -{formatCurrency(transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0))}
                </div>
                <div className="text-sm text-gray-300">Расходы в месяце</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {goals.length > 0 ? Math.round(goals.reduce((acc, goal) => acc + (goal.current / goal.target), 0) / goals.length * 100) : 0}%
                </div>
                <div className="text-sm text-gray-300">Выполнение целей</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl text-center">
                <div className="text-2xl font-bold text-yellow-400">{transactions.length}</div>
                <div className="text-sm text-gray-300">Всего операций</div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-4">🕒 Последние операции</h3>
              <div className="space-y-3">
                {transactions.slice(-5).reverse().map(transaction => (
                  <div key={transaction.id} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-b-0">
                    <div>
                      <div className="text-white">{transaction.description}</div>
                      <div className="text-xs text-gray-400">{transaction.category}</div>
                    </div>
                    <div className={`font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
    }
  };

  // Компонент для подключения к семье
  const FamilyAuthComponent = () => {
    const [mode, setMode] = useState('join'); // 'join' или 'create'
    const [inputCode, setInputCode] = useState('');
    const [inputName, setInputName] = useState('');

    const handleSubmit = (e) => {
      e.preventDefault();
      if (mode === 'create') {
        createFamily(inputName);
      } else {
        if (inputCode.length !== 8) {
          showNotification('Код семьи должен содержать 8 символов', 'error');
          return;
        }
        joinFamily(inputCode, inputName);
      }
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
              💰 Семейный бюджет
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Артур и Валерия
            </p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('join')}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                mode === 'join'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Подключиться
            </button>
            <button
              onClick={() => setMode('create')}
              className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                mode === 'create'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Создать семью
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-2">
                Ваше имя
              </label>
              <input
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="Артур или Валерия"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                required
              />
            </div>

            {mode === 'join' && (
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-2">
                  Код семьи
                </label>
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="Например: ARVAL123"
                  maxLength={8}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white font-mono text-center text-lg"
                  required
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Введите 8-символьный код семьи
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-medium"
            >
              {mode === 'create' ? '✨ Создать семью' : '🔗 Подключиться к семье'}
            </button>
          </form>

          {mode === 'create' && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-xs text-blue-700 dark:text-blue-300">
                💡 После создания семьи вы получите уникальный код, которым можно поделиться с партнером
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Показываем компонент авторизации, если не подключены к семье
  if (!isConnectedToFamily) {
    return <FamilyAuthComponent />;
  }

  return (
    <div 
      className={`min-h-screen transition-all duration-300 ${
        theme === 'light' 
          ? 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50' 
          : 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
      }`}
      style={{
        fontFamily: 'Inter, system-ui, sans-serif'
      }}
    >
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Navigation 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          theme={theme}
          toggleTheme={toggleTheme}
        />
        
        {renderContent()}
        
        <footer className="mt-12 text-center text-gray-400 text-sm">
          <p>💝 Создано с любовью для Артура и Валерии</p>
          <p>Полнофункциональное приложение для управления семейным бюджетом</p>
        </footer>
      </div>

      {/* Модальные окна */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => {setModalOpen(false); setSelectedUser('');}}
        theme={theme}
        title={
          modalType === 'transaction' ? 'Добавить операцию' :
          modalType === 'goal' ? 'Добавить цель' :
          modalType === 'addMoney' ? 'Добавить деньги к цели' :
          modalType === 'editLimit' ? 'Редактировать лимит категории' :
          modalType === 'addCategory' ? 'Добавить новую категорию' :
          'Редактировать'
        }
      >
        {modalType === 'transaction' && (
          <form onSubmit={(e) => { e.preventDefault(); addTransaction(new FormData(e.target)); }}>
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Тип операции</label>
                <select name="type" className="w-full bg-gray-700 text-white p-2 rounded" required>
                  <option value="income">Доход</option>
                  <option value="expense">Расход</option>
                </select>
              </div>
              <div>
                <label className="block text-white mb-2">Пользователь</label>
                <select name="user" defaultValue={selectedUser} className="w-full bg-gray-700 text-white p-2 rounded" required>
                  <option value="arthur">Артур</option>
                  <option value="valeria">Валерия</option>
                  <option value="shared">Общий</option>
                </select>
              </div>
              <div>
                <label className="block text-white mb-2">Сумма (zł)</label>
                <input 
                  type="number" 
                  name="amount" 
                  step="0.01" 
                  className="w-full bg-gray-700 text-white p-2 rounded" 
                  required 
                />
              </div>
              <div>
                <label className="block text-white mb-2">Описание (необязательно)</label>
                <input 
                  type="text" 
                  name="description" 
                  placeholder="Например: Продукты, Кафе, Зарплата..."
                  className="w-full bg-gray-700 text-white p-2 rounded" 
                />
              </div>
              <div>
                <label className="block text-white mb-2">Категория</label>
                <select name="category" className="w-full bg-gray-700 text-white p-2 rounded" required>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors"
              >
                Добавить операцию
              </button>
            </div>
          </form>
        )}

        {modalType === 'goal' && (
          <form onSubmit={(e) => { e.preventDefault(); addGoal(new FormData(e.target)); }}>
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Название цели</label>
                <input 
                  type="text" 
                  name="title" 
                  className="w-full bg-gray-700 text-white p-2 rounded" 
                  required 
                />
              </div>
              <div>
                <label className="block text-white mb-2">Целевая сумма</label>
                <input 
                  type="number" 
                  name="target" 
                  step="0.01" 
                  className="w-full bg-gray-700 text-white p-2 rounded" 
                  required 
                />
              </div>
              <div>
                <label className="block text-white mb-2">Дедлайн (необязательно)</label>
                <input 
                  type="date" 
                  name="deadline" 
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-gray-700 text-white p-2 rounded" 
                />
                <div className="text-xs text-gray-400 mt-1">
                  Установите срок достижения цели
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors"
              >
                Создать цель
              </button>
            </div>
          </form>
        )}

        {modalType === 'addMoney' && editingItem && (
          <form onSubmit={(e) => { 
            e.preventDefault(); 
            const amount = parseFloat(new FormData(e.target).get('amount')); 
            addMoneyToGoal(editingItem.id, amount); 
          }}>
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Цель: {editingItem.title}</label>
                <div className="text-sm text-gray-400">
                  Текущий прогресс: {(editingItem.current || 0).toLocaleString('ru-RU')} / {(editingItem.target || 0).toLocaleString('ru-RU')} zł
                </div>
              </div>
              <div>
                <label className="block text-white mb-2">Сумма для добавления (zł)</label>
                <input 
                  type="number" 
                  name="amount" 
                  step="0.01" 
                  max={editingItem.target - editingItem.current}
                  className="w-full bg-gray-700 text-white p-2 rounded" 
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded transition-colors"
              >
                Добавить деньги
              </button>
            </div>
          </form>
        )}

        {modalType === 'editLimit' && editingItem && (
          <form onSubmit={(e) => { 
            e.preventDefault(); 
            const newLimit = parseFloat(new FormData(e.target).get('limit')); 
            editCategoryLimit(editingItem.id, newLimit); 
          }}>
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Категория: {editingItem.name}</label>
                <div className="text-sm text-gray-400">
                  Текущий лимит: {(editingItem.limit || 0) > 0 ? (editingItem.limit || 0).toLocaleString('ru-RU') : '∞'} zł
                </div>
              </div>
              <div>
                <label className="block text-white mb-2">Новый лимит (zł)</label>
                <input 
                  type="number" 
                  name="limit" 
                  step="0.01" 
                  min="0"
                  defaultValue={editingItem.limit}
                  className="w-full bg-gray-700 text-white p-2 rounded" 
                  required 
                />
                <div className="text-xs text-gray-400 mt-1">
                  Введите 0 для отключения лимита
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded transition-colors"
              >
                Обновить лимит
              </button>
            </div>
          </form>
        )}

        {modalType === 'addCategory' && (
          <form onSubmit={(e) => { e.preventDefault(); addCategory(new FormData(e.target)); }}>
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Название категории</label>
                <input 
                  type="text" 
                  name="name" 
                  placeholder="Например: Здоровье, Хобби, Подарки..."
                  className="w-full bg-gray-700 text-white p-2 rounded" 
                  required 
                />
              </div>
              <div>
                <label className="block text-white mb-2">Лимит расходов (zł)</label>
                <input 
                  type="number" 
                  name="limit" 
                  step="0.01" 
                  min="0"
                  defaultValue="0"
                  className="w-full bg-gray-700 text-white p-2 rounded" 
                />
                <div className="text-xs text-gray-400 mt-1">
                  Введите 0 для отключения лимита
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white p-2 rounded transition-colors"
              >
                Создать категорию
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Уведомления */}
      {notification && (
        <Notification 
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default App;