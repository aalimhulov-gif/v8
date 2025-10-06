# 🚀 Деплой и Развертывание

## Сборка для продакшена

```bash
npm run build
```

Создается папка `dist/` с оптимизированными файлами.

## Деплой опции

### 1. Vercel (рекомендуется)

```bash
npm install -g vercel
vercel
```

### 2. Netlify

1. Перетащите папку `dist/` на https://app.netlify.com/drop
2. Или подключите GitHub репозиторий

### 3. GitHub Pages

```bash
npm run build
npm run deploy
```

### 4. Локальный сервер

```bash
npm run preview
```

## Переменные окружения

Создайте `.env` файл:

```
VITE_APP_NAME=Семейный Бюджет
VITE_VERSION=2.0.0
```

## Оптимизация

- ✅ Минификация CSS/JS
- ✅ Сжатие изображений
- ✅ Tree shaking
- ✅ Code splitting
- ✅ Service Worker готов для PWA
