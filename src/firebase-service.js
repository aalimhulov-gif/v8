// Firebase Service для работы с Firestore
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase/config.js';

// Семьи
export const createFamily = async (familyCode, familyName, createdBy) => {
  try {
    const familyRef = doc(db, 'families', familyCode);
    
    await setDoc(familyRef, {
      familyCode,
      familyName,
      createdBy,
      createdAt: serverTimestamp(),
      members: [createdBy],
      balances: {
        arthur: 2450,
        valeria: 1890,
        shared: 5670
      }
    });
    
    return { success: true, familyCode };
  } catch (error) {
    console.error('❌ Ошибка создания семьи:', error);
    return { success: false, error: error.message };
  }
};

export const joinFamily = async (familyCode, memberName) => {
  try {
    const familyRef = doc(db, 'families', familyCode);
    const familyDoc = await getDoc(familyRef);
    
    if (!familyDoc.exists()) {
      return { success: false, error: 'Семья с таким кодом не найдена' };
    }
    
    const familyData = familyDoc.data();
    if (familyData.members.includes(memberName)) {
      return { success: true, family: familyData };
    }
    
    await updateDoc(familyRef, {
      members: [...familyData.members, memberName]
    });
    
    return { success: true, family: { ...familyData, members: [...familyData.members, memberName] } };
  } catch (error) {
    console.error('❌ Ошибка подключения к семье:', error);
    return { success: false, error: error.message };
  }
};

// Транзакции
export const addTransaction = async (familyCode, transaction) => {
  try {
    const transactionRef = collection(db, 'families', familyCode, 'transactions');
    const docRef = await addDoc(transactionRef, {
      ...transaction,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Ошибка добавления транзакции:', error);
    return { success: false, error: error.message };
  }
};

export const getTransactions = async (familyCode) => {
  try {
    const transactionRef = collection(db, 'families', familyCode, 'transactions');
    const q = query(transactionRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const transactions = [];
    querySnapshot.forEach((doc) => {
      transactions.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, transactions };
  } catch (error) {
    console.error('Ошибка получения транзакций:', error);
    return { success: false, error: error.message };
  }
};

export const updateTransaction = async (familyCode, transactionId, updates) => {
  try {
    const transactionRef = doc(db, 'families', familyCode, 'transactions', transactionId);
    await updateDoc(transactionRef, updates);
    return { success: true };
  } catch (error) {
    console.error('Ошибка обновления транзакции:', error);
    return { success: false, error: error.message };
  }
};

export const deleteTransaction = async (familyCode, transactionId) => {
  console.log('🔥 Firebase deleteTransaction вызвана:', { familyCode, transactionId });
  try {
    const transactionRef = doc(db, 'families', familyCode, 'transactions', transactionId);
    console.log('📄 Документ для удаления:', transactionRef.path);
    
    await deleteDoc(transactionRef);
    console.log('✅ Документ успешно удален из Firebase');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Ошибка удаления транзакции из Firebase:', error);
    return { success: false, error: error.message };
  }
};

// Цели
export const addGoal = async (familyCode, goal) => {
  try {
    const goalRef = collection(db, 'families', familyCode, 'goals');
    const docRef = await addDoc(goalRef, {
      ...goal,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Ошибка добавления цели:', error);
    return { success: false, error: error.message };
  }
};

export const getGoals = async (familyCode) => {
  try {
    const goalRef = collection(db, 'families', familyCode, 'goals');
    const querySnapshot = await getDocs(goalRef);
    
    const goals = [];
    querySnapshot.forEach((doc) => {
      goals.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, goals };
  } catch (error) {
    console.error('Ошибка получения целей:', error);
    return { success: false, error: error.message };
  }
};

export const updateGoal = async (familyCode, goalId, updates) => {
  try {
    const goalRef = doc(db, 'families', familyCode, 'goals', goalId);
    await updateDoc(goalRef, updates);
    return { success: true };
  } catch (error) {
    console.error('Ошибка обновления цели:', error);
    return { success: false, error: error.message };
  }
};

export const deleteGoal = async (familyCode, goalId) => {
  try {
    const goalRef = doc(db, 'families', familyCode, 'goals', goalId);
    await deleteDoc(goalRef);
    return { success: true };
  } catch (error) {
    console.error('Ошибка удаления цели:', error);
    return { success: false, error: error.message };
  }
};

// Обновление баланса семьи
export const updateFamilyBalances = async (familyCode, balances) => {
  try {
    const familyRef = doc(db, 'families', familyCode);
    await updateDoc(familyRef, { balances });
    return { success: true };
  } catch (error) {
    console.error('Ошибка обновления баланса:', error);
    return { success: false, error: error.message };
  }
};

// Подписка на изменения в реальном времени
export const subscribeToFamilyData = (familyCode, callback) => {
  const familyRef = doc(db, 'families', familyCode);
  return onSnapshot(familyRef, (doc) => {
    if (doc.exists()) {
      callback({ success: true, family: doc.data() });
    } else {
      callback({ success: false, error: 'Семья не найдена' });
    }
  });
};

export const subscribeToTransactions = (familyCode, callback) => {
  console.log('🔔 Создаём подписку на транзакции для семьи:', familyCode);
  const transactionRef = collection(db, 'families', familyCode, 'transactions');
  const q = query(transactionRef, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (querySnapshot) => {
    console.log('📡 Firebase подписка сработала, размер снапшота:', querySnapshot.size);
    const transactions = [];
    
    querySnapshot.forEach((doc) => {
      const transaction = { id: doc.id, ...doc.data() };
      console.log('📄 Документ транзакции:', transaction);
      transactions.push(transaction);
    });
    
    console.log('📊 Итого транзакций отправляем в callback:', transactions.length);
    console.log('🆔 ID всех транзакций:', transactions.map(t => t.id));
    
    callback({ success: true, transactions });
  }, (error) => {
    console.error('❌ Ошибка подписки на транзакции:', error);
    callback({ success: false, error: error.message, transactions: [] });
  });
};

export const subscribeToGoals = (familyCode, callback) => {
  const goalRef = collection(db, 'families', familyCode, 'goals');
  
  return onSnapshot(goalRef, (querySnapshot) => {
    const goals = [];
    querySnapshot.forEach((doc) => {
      goals.push({ id: doc.id, ...doc.data() });
    });
    console.log('🔄 Обновление целей из Firebase:', goals.length);
    callback({ success: true, goals });
  }, (error) => {
    console.error('❌ Ошибка подписки на цели:', error);
    callback({ success: false, error: error.message, goals: [] });
  });
};