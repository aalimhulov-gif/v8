import { useState, useEffect } from 'react';
import { 
  subscribeToFamilyData,
  subscribeToTransactions,
  addTransaction,
  deleteTransaction
} from './firebase/service';

function App() {
  const [familyId] = useState('HQD748T');
  const [familyData, setFamilyData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Автоподключение к семье
  useEffect(() => {
    if (familyId) {
      console.log(' Подключение к семье:', familyId);
      
      const unsubscribeFamily = subscribeToFamilyData(familyId, (data) => {
        setFamilyData(data);
        setIsLoading(false);
      });

      const unsubscribeTransactions = subscribeToTransactions(familyId, (data) => {
        setTransactions(data);
      });

      return () => {
        unsubscribeFamily();
        unsubscribeTransactions();
      };
    }
  }, [familyId]);

  const handleAddTransaction = async (transaction) => {
    try {
      await addTransaction(familyId, transaction);
      setNotification({ type: 'success', message: 'Операция добавлена!' });
      setShowAddModal(false);
    } catch (error) {
      setNotification({ type: 'error', message: 'Ошибка добавления операции' });
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      await deleteTransaction(familyId, transactionId);
      setNotification({ type: 'success', message: 'Операция удалена!' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Ошибка удаления операции' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  const arthurBalance = familyData?.balances?.arthur || 0;
  const valeriaBalance = familyData?.balances?.valeria || 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-8">
          💰 Семейный бюджет {familyId}
        </h1>

        {/* Карточки балансов */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Артур</h3>
              <span className="text-2xl">👨‍💻</span>
            </div>
            <div className="text-3xl font-bold mb-2">
              {arthurBalance.toLocaleString('ru-RU')} zł
            </div>
            <div className="text-sm text-gray-300">Доступно для трат</div>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-600/20 border border-pink-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Валерия</h3>
              <span className="text-2xl">👩‍🎨</span>
            </div>
            <div className="text-3xl font-bold mb-2">
              {valeriaBalance.toLocaleString('ru-RU')} zł
            </div>
            <div className="text-sm text-gray-300">Доступно для трат</div>
          </div>
        </div>

        {/* Кнопка добавления операции */}
        <div className="text-center mb-8">
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-700 px-8 py-3 rounded-lg font-semibold transition-colors text-lg"
          >
            ➕ Добавить операцию
          </button>
        </div>

        {/* Список операций */}
        <div className="bg-gray-800/50 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-6">📋 Операции</h2>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-400 text-lg">Операций пока нет</p>
              <p className="text-gray-500 text-sm">Добавьте первую операцию</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex justify-between items-center p-4 bg-gray-700/50 rounded-xl hover:bg-gray-700/70 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-lg">
                        {transaction.type === 'income' ? '📈' : '📉'}
                      </span>
                      <span className="font-medium text-lg">{transaction.description}</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {transaction.user === 'arthur' ? '👨‍💻 Артур' : '👩‍🎨 Валерия'} • {transaction.category}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xl font-bold ${
                      transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString('ru-RU')} zł
                    </span>
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded hover:bg-red-400/10 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно добавления операции */}
      {showAddModal && (
        <TransactionModal 
          onSubmit={handleAddTransaction}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Уведомления */}
      {notification && (
        <Notification 
          notification={notification}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

// Компонент модального окна
function TransactionModal({ onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    description: '',
    category: 'Еда',
    user: 'arthur'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.amount || !formData.description) return;

    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      date: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-semibold">💰 Новая операция</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Тип операции</label>
            <select 
              value={formData.type} 
              onChange={(e) => setFormData({...formData, type: e.target.value})}
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="expense">📉 Расход</option>
              <option value="income">📈 Доход</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Пользователь</label>
            <select 
              value={formData.user} 
              onChange={(e) => setFormData({...formData, user: e.target.value})}
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="arthur">👨‍💻 Артур</option>
              <option value="valeria">👩‍🎨 Валерия</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Сумма (zł)</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Описание</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
              placeholder="Описание операции"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Категория</label>
            <select 
              value={formData.category} 
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              <option value="Еда">🍕 Еда</option>
              <option value="Транспорт">🚗 Транспорт</option>
              <option value="Развлечения">🎮 Развлечения</option>
              <option value="Покупки">🛍️ Покупки</option>
              <option value="Здоровье">💊 Здоровье</option>
              <option value="Коммунальные">🏠 Коммунальные</option>
              <option value="Прочее">📦 Прочее</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-medium transition-colors"
            >
              ✅ Добавить
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 py-3 rounded-lg font-medium transition-colors"
            >
              ❌ Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Компонент уведомлений
function Notification({ notification, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className={`p-4 rounded-lg shadow-lg ${
        notification.type === 'success' 
          ? 'bg-green-600 border border-green-500' 
          : 'bg-red-600 border border-red-500'
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-xl">
            {notification.type === 'success' ? '✅' : '❌'}
          </span>
          <span className="font-medium">{notification.message}</span>
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white ml-2"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
