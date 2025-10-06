// Экспорты Firebase сервисов
export {
  subscribeToFamilyData,
  subscribeToTransactions,
  addTransaction,
  deleteTransaction,
  updateFamilyBalances,
  createFamily
} from './service.js';

export { db } from './config.js';