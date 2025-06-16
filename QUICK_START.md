# 🚀 Быстрый запуск

## Минимальная установка (5 минут)

### 1. Установка зависимостей
```bash
# Установка всех зависимостей одной командой
npm run install-all
```

### 2. Запуск MongoDB
```bash
# Windows (если установлен как сервис)
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
# или
brew services start mongodb-community
```

### 3. Запуск приложения
```bash
# Запуск backend и frontend одновременно
npm run dev
```

### 4. Открыть в браузере
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## 🔐 Данные для входа

### Администратор (создается автоматически)
- **Email:** admin@school.com
- **Пароль:** admin123

## ✅ Проверка работы

1. Откройте http://localhost:3000
2. Войдите как администратор
3. Создайте тестовый класс
4. Добавьте студента
5. Проверьте уведомления

## 🔧 Если что-то не работает

### Проблема: MongoDB не подключается
```bash
# Проверьте статус MongoDB
mongosh --eval "db.adminCommand('ismaster')"
```

### Проблема: Порт занят
```bash
# Найти процесс на порту 5000
netstat -ano | findstr :5000
# Завершить процесс
taskkill /PID <PID> /F
```

### Проблема: Ошибки зависимостей
```bash
# Очистить кэш и переустановить
npm run clean-install
```

## 📝 Следующие шаги

1. Изучите [полную документацию](README.md)
2. Настройте переменные окружения
3. Создайте тестовые данные: `npm run seed`
4. Изучите API: http://localhost:5000/api-info

## 🆘 Нужна помощь?

- Проверьте логи: `backend/logs/combined.log`
- Откройте issue в GitHub
- Напишите на support@schoolmanagement.com 