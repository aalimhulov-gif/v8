// Firebase Service - простая и понятная логика
import { 
  collection, 
  doc, 
  getDoc,
  setDoc, 
  addDoc, 
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { db } from './config.js';

// 1. Подключение к семье - получение данных семьи
export const subscribeToFamilyData = (familyId, callback) => {
  console.log(' Подключение к семье:', familyId);
  
  const familyRef = doc(db, 'families', familyId);
  
  return onSnapshot(familyRef, (doc) => {
    if (doc.exists()) {
      console.log(' Данные семьи получены:', doc.data());
      callback(doc.data());
    } else {
      console.log(' Семья не найдена, создаем новую');
      // Создаем семью если её нет
      setDoc(familyRef, {
        id: familyId,
        name: 'Семья Артура и Валерии',
        balances: {
          arthur: 0,
          valeria: 0
        },
        createdAt: serverTimestamp()
      }).then(() => {
        console.log(' Семья создана');
      });
    }
  }, (error) => {
    console.error(' Ошибка получения данных семьи:', error);
  });
};

// 2. Подписка на транзакции
export const subscribeToTransactions = (familyId, callback) => {
  console.log(' Подписка на транзакции для семьи:', familyId);
  
  const transactionsRef = collection(db, 'families', familyId, 'transactions');
  
  return onSnapshot(transactionsRef, (snapshot) => {
    const transactions = [];
    snapshot.forEach((doc) => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    // Сортируем по дате (новые сначала)
    transactions.sort((a, b) => {
      const aDate = a.createdAt?.toDate?.() || new Date(a.date || 0);
      const bDate = b.createdAt?.toDate?.() || new Date(b.date || 0);
      return bDate - aDate;
    });
    
    console.log(' Транзакции получены:', transactions.length);
    callback(transactions);
  }, (error) => {
    console.error(' Ошибка получения транзакций:', error);
    callback([]);
  });
};

// 3. Добавление новой транзакции
export const addTransaction = async (familyId, transaction) => {
  try {
    console.log(' Добавление транзакции:', transaction);
    
    const transactionsRef = collection(db, 'families', familyId, 'transactions');
    
    const newTransaction = {
      ...transaction,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(transactionsRef, newTransaction);
    console.log(' Транзакция добавлена с ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error(' Ошибка добавления транзакции:', error);
    throw error;
  }
};

// 4. Удаление транзакции
export const deleteTransaction = async (familyId, transactionId) => {
  try {
    console.log(' Удаление транзакции:', transactionId);
    
    const transactionRef = doc(db, 'families', familyId, 'transactions', transactionId);
    await deleteDoc(transactionRef);
    
    console.log(' Транзакция удалена:', transactionId);
  } catch (error) {
    console.error(' Ошибка удаления транзакции:', error);
    throw error;
  }
};

// 5. Обновление баланса семьи
export const updateFamilyBalances = async (familyId, balances) => {
  try {
    console.log(' Обновление балансов:', balances);
    
    const familyRef = doc(db, 'families', familyId);
    await updateDoc(familyRef, {
      balances: balances,
      updatedAt: serverTimestamp()
    });
    
    console.log(' Балансы обновлены');
  } catch (error) {
    console.error(' Ошибка обновления балансов:', error);
    throw error;
  }
};

// 6. Создание новой семьи (если понадобится)
export const createFamily = async (familyId, familyName) => {
  try {
    console.log(' Создание семьи:', familyId);
    
    const familyRef = doc(db, 'families', familyId);
    const familyData = {
      id: familyId,
      name: familyName,
      balances: {
        arthur: 0,
        valeria: 0
      },
      createdAt: serverTimestamp()
    };
    
    await setDoc(familyRef, familyData);
    console.log(' Семья создана:', familyId);
    
    return familyData;
  } catch (error) {
    console.error(' Ошибка создания семьи:', error);
    throw error;
  }
};
