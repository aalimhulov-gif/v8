# Budget Share - Семейный бюджет

Современное веб-приложение для совместного управления семейным бюджетом Артура и Леры.

## 🚀 Технологии

- **Frontend**: React 18 + Vite 5
- **Стили**: Tailwind CSS v3 (тёмная тема, адаптивный дизайн)
- **Анимации**: Framer Motion
- **База данных**: Firebase 10+ (Auth + Firestore + Realtime Database)
- **Навигация**: React Router v6
- **Графики**: Recharts
- **Состояние**: Zustand
- **UI компоненты**: ShadCN UI style
- **Иконки**: Lucide React
- **Качество кода**: ESLint + Prettier

## 📁 Структура проекта

```
/src
  /assets        → иконки, изображения
  /components    → переиспользуемые компоненты
    /ui          → базовые UI компоненты (Button, Card, Input, etc.)
    BalanceCard.jsx
    Header.jsx
  /pages         → страницы приложения
    Dashboard.jsx
    Goals.jsx
    Categories.jsx
    Limits.jsx
    Analytics.jsx
    Settings.jsx
    Login.jsx
  /firebase      → конфигурация и функции Firebase
    config.js
    auth.js
    firestore.js
  /store         → Zustand состояние
    index.js
  /utils         → утилиты и хелперы
    index.js
  /hooks         → кастомные React хуки
main.jsx
App.jsx
index.css
```

## 🧾 Функционал

### ✅ Реализовано

1. **Dashboard (Главная страница)**
   - Карточки баланса для Артура, Леры и общего баланса
   - Последние операции
   - Активные цели
   - Быстрые действия

2. **Система авторизации**
   - Вход/регистрация через email/password
   - Вход через Google
   - Управление семьями (FamilyID)
   - Защищённые роуты

3. **Цели**
   - Создание и управление финансовыми целями
   - Прогресс-бары с анимациями
   - Дедлайны и статусы

4. **Категории**
   - Управление категориями доходов и расходов
   - Лимиты по категориям
   - Статистика использования

5. **Лимиты расходов**
   - Месячные лимиты по категориям
   - Предупреждения при превышении
   - Визуальные индикаторы

6. **Аналитика**
   - Графики доходов и расходов (Recharts)
   - Распределение по категориям
   - Динамика за период
   - Ключевые метрики

7. **Настройки**
   - Управление профилем
   - Переключение темы (тёмная/светлая)
   - Настройки уведомлений
   - Безопасность

8. **UI/UX**
   - Современный дизайн в стиле ShadCN UI
   - Тёмная тема по умолчанию
   - Плавные анимации Framer Motion
   - Адаптивный дизайн (desktop/mobile)
   - Красивые карточки с градиентами

## 🔧 Установка и запуск

### Предварительные требования

- Node.js 18+
- npm или yarn

### Шаги установки

1. **Клонирование репозитория**
   ```bash
   git clone <repository-url>
   cd budget-sharing-app
   ```

2. **Установка зависимостей**
   ```bash
   npm install
   ```

3. **Настройка Firebase**
   
   Откройте файл `src/firebase/config.js` и замените конфигурацию на свою:
   
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key-here",
     authDomain: "your-project.firebaseapp.com",
     databaseURL: "https://your-project-default-rtdb.firebaseio.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123def456",
     measurementId: "G-ABC123DEF4"
   };
   ```

4. **Запуск в режиме разработки**
   ```bash
   npm run dev
   ```

   Приложение будет доступно по адресу: `http://localhost:3000`

5. **Сборка для продакшена**
   ```bash
   npm run build
   ```

## 🔥 Firebase настройка

### Создание проекта Firebase

1. Перейдите в [Firebase Console](https://console.firebase.google.com/)
2. Создайте новый проект
3. Включите Authentication (Email/Password и Google)
4. Создайте Firestore Database
5. Создайте Realtime Database
6. Скопируйте конфигурацию в `src/firebase/config.js`

### Правила безопасности Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Правила для семей
    match /families/{familyId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.members;
      
      // Правила для подколлекций семьи
      match /{collection}/{document} {
        allow read, write: if request.auth != null && 
          request.auth.uid in get(/databases/$(database)/documents/families/$(familyId)).data.members;
      }
    }
    
    // Правила для пользователей
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 🚀 Деплой

### Firebase Hosting

1. Установите Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Войдите в Firebase:
   ```bash
   firebase login
   ```

3. Инициализируйте проект:
   ```bash
   firebase init hosting
   ```

4. Соберите проект:
   ```bash
   npm run build
   ```

5. Задеплойте:
   ```bash
   firebase deploy
   ```

### GitHub Pages

1. Установите gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Добавьте в `package.json`:
   ```json
   {
     "homepage": "https://yourusername.github.io/budget-sharing-app",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. Деплой:
   ```bash
   npm run deploy
   ```

## 👥 Демо аккаунты

Для тестирования приложения используйте:

- **Артур**: `arthur@example.com` / `password123`
- **Лера**: `valeria@example.com` / `password123`

## 🎨 Кастомизация

### Цвета

Основные цвета определены в `tailwind.config.js`:

```javascript
colors: {
  arthur: "#8b5cf6",    // Фиолетовый для Артура
  valeria: "#ec4899",   // Розовый для Леры
  shared: "#f59e0b",    // Жёлтый для общих средств
  income: "#10b981",    // Зелёный для доходов
  expense: "#ef4444",   // Красный для расходов
}
```

### Темы

Тёмная тема настроена в `src/index.css` с CSS переменными.

## 📱 Мобильная версия

Приложение полностью адаптивно:
- Адаптивное меню для мобильных устройств
- Оптимизированные карточки баланса
- Touch-friendly интерфейс
- Быстрые действия для мобильных

## 🔄 Состояние и данные

### Zustand Store

- `useAuthStore` - авторизация и пользователь
- `useBalanceStore` - балансы и статистика
- `useOperationsStore` - операции и фильтры
- `useGoalsStore` - цели
- `useAppStore` - настройки приложения

### Firebase структура

```
/families/{familyId}
  - members: []
  - settings: {}
  
  /operations/{operationId}
    - type: 'income' | 'expense'
    - amount: number
    - category: string
    - userId: string
    - createdAt: timestamp
  
  /goals/{goalId}
    - title: string
    - targetAmount: number
    - currentAmount: number
    - deadline: date
  
  /categories/{categoryId}
    - name: string
    - type: 'income' | 'expense'
    - limit?: number
```

## 🛠️ Разработка

### Добавление новых компонентов

1. Создайте компонент в соответствующей папке
2. Используйте Tailwind классы и утилиты из `src/utils`
3. Добавьте анимации с Framer Motion
4. Экспортируйте из index файла

### Стиль кода

- Используется Prettier для форматирования
- ESLint для проверки качества кода
- Комментарии на русском языке
- Именование переменных на английском

## 📝 Todo

- [ ] Добавление операций через модальные окна
- [ ] Экспорт отчётов в PDF/Excel
- [ ] Push уведомления
- [ ] Офлайн режим с синхронизацией
- [ ] Планировщик бюджета
- [ ] Сканирование чеков
- [ ] Интеграция с банковскими API

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для фичи: `git checkout -b feature/новая-фича`
3. Закоммитьте изменения: `git commit -m 'Добавить новую фичу'`
4. Запушьте в ветку: `git push origin feature/новая-фича`
5. Создайте Pull Request

## 📄 Лицензия

MIT License

## 📞 Поддержка

Если у вас есть вопросы или проблемы:

1. Создайте Issue в GitHub
2. Напишите на email: support@budgetshare.com
3. Проверьте документацию Firebase

---

**Budget Share** - современное решение для семейного бюджета! 💰✨