# Настройка Firebase для синхронизации между устройствами

## Шаг 1: Создание проекта Firebase

1. Перейдите на [Firebase Console](https://console.firebase.google.com/)
2. Нажмите "Создать проект" или "Add project"
3. Введите название проекта: `family-budget-app`
4. Выберите настройки по умолчанию

## Шаг 2: Настройка Firestore Database

1. В боковом меню выберите "Firestore Database"
2. Нажмите "Создать базу данных"
3. Выберите режим тестирования (Test mode) для начала
4. Выберите регион (например, europe-west1)

## Шаг 3: Получение конфигурации

1. В настройках проекта найдите раздел "Ваши приложения"
2. Нажмите на значок веб-приложения (</>)
3. Введите название приложения: `family-budget-web`
4. Скопируйте объект `firebaseConfig`

## Шаг 4: Обновление конфигурации

Замените содержимое файла `src/firebase-config.js` на:

```javascript
// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// ВСТАВЬТЕ ВАШУ КОНФИГУРАЦИЮ СЮДА
const firebaseConfig = {
  apiKey: 'ваш-api-key',
  authDomain: 'ваш-проект.firebaseapp.com',
  projectId: 'ваш-project-id',
  storageBucket: 'ваш-проект.appspot.com',
  messagingSenderId: 'ваш-sender-id',
  appId: 'ваш-app-id',
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);

// Инициализация Firestore
const db = getFirestore(app);

export { db };
```

## Шаг 5: Правила безопасности Firestore

В разделе "Firestore Database" → "Rules" вставьте эти правила:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /families/{familyId} {
      allow read, write: if request.auth != null;

      match /transactions/{transactionId} {
        allow read, write: if request.auth != null;
      }

      match /goals/{goalId} {
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

## Шаг 6: Включение Firebase интеграции

В файле `src/App.jsx` раскомментируйте строки импорта Firebase:

```javascript
import {
  createFamily as createFamilyFirestore,
  joinFamily as joinFamilyFirestore,
  subscribeToFamilyData,
  subscribeToTransactions,
  subscribeToGoals,
} from './firebase-service.js';
```

## Структура данных в Firestore

### Коллекция `families`

```
families/
  {familyCode}/
    familyCode: string
    familyName: string
    createdBy: string
    createdAt: timestamp
    members: array
    balances: {
      arthur: number,
      valeria: number,
      shared: number
    }

    transactions/
      {transactionId}/
        user: string
        type: string
        amount: number
        description: string
        category: string
        date: timestamp
        createdAt: timestamp

    goals/
      {goalId}/
        title: string
        current: number
        target: number
        color: string
        deadline: string
        createdAt: timestamp
```

## Готово!

После выполнения всех шагов приложение будет синхронизироваться между устройствами в реальном времени. Создав семью на одном устройстве, вы сможете подключиться к ней с другого устройства, используя 8-символьный код семьи.

## Отладка

Если возникают проблемы:

1. Проверьте правильность конфигурации в `firebase-config.js`
2. Убедитесь, что Firestore Database создана
3. Проверьте правила безопасности
4. Откройте консоль браузера для просмотра ошибок
