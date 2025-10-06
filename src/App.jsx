import { useState, useEffect } from 'react';
import { 
  subscribeToFamilyData,
  subscribeToTransactions,
  addTransaction,
  deleteTransaction
} from './firebase/service';

// Компонент навигации
function Navigation({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'home', label: 'Главная', icon: '🏠' },
    { id: 'operations', label: 'Операции', icon: '📊' },
    { id: 'goals', label: 'Цели', icon: '🎯' },
    { id: 'categories', label: 'Категории', icon: '📂' },
    { id: 'analytics', label: 'Аналитика', icon: '📈' },
    { id: 'settings', label: 'Настройки', icon: '⚙️' }
  ];

  return (
    <nav className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700">
      <div className="container mx-auto px-6 py-4">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

function App() {
  const [familyId] = useState('HQD748T');
  const [familyData, setFamilyData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

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
      {/* Навигация */}
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-center mb-8">
          💰 Семейный бюджет
        </h1>

        {activeTab === 'home' && (
          <>
            {/* Карточки балансов */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Артур</h3>
                  <span className="text-2xl">�</span>
                </div>
                <div className="text-3xl font-bold mb-2">
                  {arthurBalance.toLocaleString('ru-RU')} zł
                </div>
                <div className="text-sm text-gray-300">Доступно для трат</div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-green-400">+3 000 zł</span>
                  <span className="text-red-400">-320 zł</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-pink-500/20 to-pink-600/20 border border-pink-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Валерия</h3>
                  <span className="text-2xl">❤️</span>
                </div>
                <div className="text-3xl font-bold mb-2">
                  {valeriaBalance.toLocaleString('ru-RU')} zł
                </div>
                <div className="text-sm text-gray-300">Доступно для трат</div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-green-400">+2 500 zł</span>
                  <span className="text-red-400">-280 zł</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">Общий бюджет</h3>
                  <span className="text-2xl">🧡</span>
                </div>
                <div className="text-3xl font-bold mb-2">
                  {(arthurBalance + valeriaBalance).toLocaleString('ru-RU')} zł
                </div>
                <div className="text-sm text-gray-300">Доступно для трат</div>
                <div className="flex justify-between mt-2 text-sm">
                  <span className="text-green-400">+0 zł</span>
                  <span className="text-red-400">-800 zł</span>
                </div>
              </div>
            </div>

            {/* Статистика */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">+5 500 zł</div>
                <div className="text-sm text-gray-400">Доходы в месяце</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400">-1 490 zł</div>
                <div className="text-sm text-gray-400">Расходы в месяце</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">28%</div>
                <div className="text-sm text-gray-400">Выполнение целей</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{transactions.length}</div>
                <div className="text-sm text-gray-400">Всего операций</div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'operations' && (
          <>
            {/* Список операций */}
            <div className="bg-gray-800/50 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">🗂️ Последние операции</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  ➕ Добавить операцию
                </button>
              </div>
              
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
          </>
        )}

        {activeTab === 'goals' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center">🎯 Финансовые цели</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Цель 1 */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">🏠 Первоначальный взнос</h3>
                  <span className="text-sm text-green-400">28%</span>
                </div>
                <div className="mb-4">
                  <div className="text-2xl font-bold mb-2">8 400 zł / 30 000 zł</div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div className="bg-green-500 h-3 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                </div>
                <div className="text-sm text-gray-300">До цели: 21 600 zł</div>
              </div>

              {/* Цель 2 */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">✈️ Отпуск в Италию</h3>
                  <span className="text-sm text-blue-400">65%</span>
                </div>
                <div className="mb-4">
                  <div className="text-2xl font-bold mb-2">3 250 zł / 5 000 zł</div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
                <div className="text-sm text-gray-300">До цели: 1 750 zł</div>
              </div>

              {/* Цель 3 */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">💻 Новый MacBook</h3>
                  <span className="text-sm text-purple-400">15%</span>
                </div>
                <div className="mb-4">
                  <div className="text-2xl font-bold mb-2">1 200 zł / 8 000 zł</div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div className="bg-purple-500 h-3 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
                <div className="text-sm text-gray-300">До цели: 6 800 zł</div>
              </div>

              {/* Цель 4 */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 border border-orange-500/30">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold">🚗 Автомобиль</h3>
                  <span className="text-sm text-orange-400">5%</span>
                </div>
                <div className="mb-4">
                  <div className="text-2xl font-bold mb-2">2 500 zł / 50 000 zł</div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div className="bg-orange-500 h-3 rounded-full" style={{ width: '5%' }}></div>
                  </div>
                </div>
                <div className="text-sm text-gray-300">До цели: 47 500 zł</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center">📂 Категории расходов</h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { name: 'Продукты', icon: '🛒', spent: 890, limit: 1200, color: 'green' },
                { name: 'Транспорт', icon: '🚗', spent: 320, limit: 400, color: 'blue' },
                { name: 'Развлечения', icon: '🎭', spent: 280, limit: 300, color: 'purple' },
                { name: 'Коммуналка', icon: '🏠', spent: 450, limit: 500, color: 'orange' },
                { name: 'Здоровье', icon: '💊', spent: 150, limit: 300, color: 'red' },
                { name: 'Образование', icon: '📚', spent: 200, limit: 400, color: 'indigo' }
              ].map((category) => (
                <div key={category.name} className={`p-4 rounded-xl bg-gradient-to-br from-${category.color}-500/20 to-${category.color}-600/20 border border-${category.color}-500/30`}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{category.icon} {category.name}</h3>
                    <span className="text-sm">{Math.round((category.spent / category.limit) * 100)}%</span>
                  </div>
                  <div className="mb-2">
                    <div className="text-lg font-bold">{category.spent} zł / {category.limit} zł</div>
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div 
                        className={`bg-${category.color}-500 h-2 rounded-full`} 
                        style={{ width: `${Math.min((category.spent / category.limit) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-300">
                    Осталось: {category.limit - category.spent} zł
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center">📈 Аналитика</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">💰 Баланс по месяцам</h3>
                <div className="space-y-3">
                  {['Январь', 'Февраль', 'Март', 'Апрель'].map((month, index) => (
                    <div key={month} className="flex justify-between items-center">
                      <span>{month}</span>
                      <span className="font-bold text-green-400">+{(1200 + index * 300).toLocaleString()} zł</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">📊 Категории расходов</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Продукты', amount: 890, color: 'green' },
                    { name: 'Транспорт', amount: 320, color: 'blue' },
                    { name: 'Коммуналка', amount: 450, color: 'orange' },
                    { name: 'Развлечения', amount: 280, color: 'purple' }
                  ].map((item) => (
                    <div key={item.name} className="flex justify-between items-center">
                      <span>{item.name}</span>
                      <span className={`font-bold text-${item.color}-400`}>{item.amount} zł</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-center">⚙️ Настройки</h2>
            
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-gray-800/50 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">👥 Семейный профиль</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Family ID</label>
                    <input 
                      type="text" 
                      value={familyId} 
                      readOnly 
                      className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600"
                    />
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">👨‍💻 Артур</label>
                      <div className="p-3 bg-gray-700 rounded-lg">
                        Баланс: {arthurBalance.toLocaleString()} zł
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">👩‍🎨 Валерия</label>
                      <div className="p-3 bg-gray-700 rounded-lg">
                        Баланс: {valeriaBalance.toLocaleString()} zł
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-4">🎨 Внешний вид</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Тема</label>
                    <select className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600">
                      <option>🌙 Темная тема</option>
                      <option>☀️ Светлая тема</option>
                      <option>🎯 Автоматическая</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Валюта</label>
                    <select className="w-full p-3 bg-gray-700 rounded-lg border border-gray-600">
                      <option>🇵🇱 Польский злотый (zł)</option>
                      <option>💵 Доллар США ($)</option>
                      <option>💶 Евро (€)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
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
