// Firebase Hook для управления синхронизацией
import { useState, useEffect } from 'react';

// Флаг для включения/выключения Firebase
const FIREBASE_ENABLED = true; // Установите в true после настройки Firebase

// Заглушки для Firebase функций когда Firebase отключен
const mockFirebaseService = {
  createFamily: async (familyCode, familyName, createdBy) => {
    console.log('Mock: Создание семьи', { familyCode, familyName, createdBy });
    return { success: true, familyCode };
  },
  
  joinFamily: async (familyCode, memberName) => {
    console.log('Mock: Подключение к семье', { familyCode, memberName });
    return { 
      success: true, 
      family: { 
        familyCode, 
        members: [memberName],
        balances: { arthur: 2450, valeria: 1890, shared: 5670 }
      } 
    };
  },
  
  subscribeToFamilyData: (familyCode) => {
    console.log('Mock: Подписка на данные семьи', familyCode);
    return () => console.log('Mock: Отписка от данных семьи');
  },
  
  subscribeToTransactions: (familyCode) => {
    console.log('Mock: Подписка на транзакции', familyCode);
    return () => console.log('Mock: Отписка от транзакций');
  },
  
  subscribeToGoals: (familyCode) => {
    console.log('Mock: Подписка на цели', familyCode);
    return () => console.log('Mock: Отписка от целей');
  }
};

// Hook для Firebase
export const useFirebase = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (FIREBASE_ENABLED) {
      // Здесь будет проверка подключения к Firebase
      setIsConnected(true);
    } else {
      console.log('Firebase отключен - используется локальный режим');
      setIsConnected(false);
    }
  }, []);

  const getFirebaseService = async () => {
    if (!FIREBASE_ENABLED) {
      return mockFirebaseService;
    }
    
    try {
      // Динамический импорт Firebase сервисов
      const firebaseService = await import('../firebase-service.js');
      return firebaseService;
    } catch (err) {
      console.error('Ошибка загрузки Firebase:', err);
      setError(err.message);
      return mockFirebaseService;
    }
  };

  return {
    isConnected,
    error,
    getFirebaseService,
    isEnabled: FIREBASE_ENABLED
  };
};

// Hook для семейных данных
export const useFamilyData = (familyCode) => {
  const [familyData, setFamilyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const { getFirebaseService, isEnabled } = useFirebase();

  useEffect(() => {
    if (!familyCode || !isEnabled) return;

    let unsubscribe = null;
    
    const setupSubscription = async () => {
      setLoading(true);
      try {
        const service = await getFirebaseService();
        unsubscribe = service.subscribeToFamilyData(familyCode, (result) => {
          if (result.success) {
            setFamilyData(result.family);
          } else {
            console.error('Ошибка получения данных семьи:', result.error);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Ошибка настройки подписки:', error);
        setLoading(false);
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [familyCode, isEnabled, getFirebaseService]);

  return { familyData, loading };
};

// Hook для транзакций
export const useTransactions = (familyCode) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getFirebaseService, isEnabled } = useFirebase();

  useEffect(() => {
    if (!familyCode || !isEnabled) return;

    let unsubscribe = null;
    
    const setupSubscription = async () => {
      setLoading(true);
      try {
        const service = await getFirebaseService();
        unsubscribe = service.subscribeToTransactions(familyCode, (result) => {
          if (result.success) {
            setTransactions(result.transactions);
          } else {
            console.error('Ошибка получения транзакций:', result.error);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Ошибка настройки подписки на транзакции:', error);
        setLoading(false);
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [familyCode, isEnabled, getFirebaseService]);

  return { transactions, loading };
};

// Hook для целей
export const useGoals = (familyCode) => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const { getFirebaseService, isEnabled } = useFirebase();

  useEffect(() => {
    if (!familyCode || !isEnabled) return;

    let unsubscribe = null;
    
    const setupSubscription = async () => {
      setLoading(true);
      try {
        const service = await getFirebaseService();
        unsubscribe = service.subscribeToGoals(familyCode, (result) => {
          if (result.success) {
            setGoals(result.goals);
          } else {
            console.error('Ошибка получения целей:', result.error);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Ошибка настройки подписки на цели:', error);
        setLoading(false);
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [familyCode, isEnabled, getFirebaseService]);

  return { goals, loading };
};