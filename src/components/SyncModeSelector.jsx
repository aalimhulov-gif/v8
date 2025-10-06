// Компонент для управления режимом синхронизации
import { useState } from 'react';

const SyncModeSelector = ({ onModeChange, currentMode = 'local' }) => {
  const [mode, setMode] = useState(currentMode);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl">
      <h4 className="text-white font-medium mb-3">💫 Режим синхронизации</h4>
      
      <div className="space-y-3">
        <div 
          className={`p-3 rounded-lg cursor-pointer transition-colors ${
            mode === 'local' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
          }`}
          onClick={() => handleModeChange('local')}
        >
          <div className="flex items-center gap-3">
            <span>📱</span>
            <div>
              <div className="font-medium">Локальный режим</div>
              <div className="text-xs opacity-75">
                Данные сохраняются только на этом устройстве
              </div>
            </div>
          </div>
        </div>

        <div 
          className={`p-3 rounded-lg cursor-pointer transition-colors ${
            mode === 'firebase' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
          }`}
          onClick={() => handleModeChange('firebase')}
        >
          <div className="flex items-center gap-3">
            <span>☁️</span>
            <div>
              <div className="font-medium">Облачная синхронизация</div>
              <div className="text-xs opacity-75">
                Данные синхронизируются между всеми устройствами
              </div>
            </div>
          </div>
        </div>
      </div>

      {mode === 'firebase' && (
        <div className="mt-3 p-3 bg-yellow-600/20 rounded-lg">
          <div className="text-xs text-yellow-300">
            ⚠️ Требуется настройка Firebase. 
            <br />
            См. файл FIREBASE_SETUP.md для инструкций.
          </div>
        </div>
      )}

      {mode === 'local' && (
        <div className="mt-3 p-3 bg-blue-600/20 rounded-lg">
          <div className="text-xs text-blue-300">
            ℹ️ В локальном режиме семейные коды работают только как демонстрация.
            Реальная синхронизация между устройствами требует Firebase.
          </div>
        </div>
      )}
    </div>
  );
};

export default SyncModeSelector;