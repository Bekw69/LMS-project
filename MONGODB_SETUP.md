# 🗄️ Установка MongoDB

## Проблема
MongoDB не установлена на вашем компьютере. Для работы приложения необходима база данных MongoDB.

## Решения

### Вариант 1: Установка MongoDB локально (Рекомендуется)

#### Windows
1. Скачайте MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Запустите установщик и следуйте инструкциям
3. Выберите "Complete" установку
4. Установите MongoDB как Windows Service
5. После установки MongoDB должна запуститься автоматически

#### Проверка установки:
```powershell
# Проверить статус службы
Get-Service MongoDB

# Запустить службу если не запущена
Start-Service MongoDB
```

### Вариант 2: Использование MongoDB Atlas (Облачная БД)

1. Создайте бесплатный аккаунт на https://www.mongodb.com/cloud/atlas
2. Создайте новый кластер (выберите FREE tier)
3. Настройте доступ:
   - Создайте пользователя БД
   - Добавьте ваш IP в whitelist (или 0.0.0.0/0 для доступа отовсюду)
4. Получите строку подключения
5. Обновите файл `backend/.env`:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/school?retryWrites=true&w=majority
```

### Вариант 3: Docker (если установлен Docker)

```bash
# Запустить MongoDB в Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Текущая конфигурация

Приложение пытается подключиться к:
- `mongodb://127.0.0.1:27017/school`

Если MongoDB запущена на стандартном порту, приложение подключится автоматически.

## Временное решение

Пока MongoDB не установлена, вы можете:
1. Использовать MongoDB Atlas (облачное решение)
2. Установить MongoDB локально
3. Использовать Docker

## После установки MongoDB

1. Перезапустите backend сервер:
```bash
cd backend
npm start
```

2. Проверьте подключение:
```bash
curl http://localhost:5000/health
```

База данных должна показать статус "connected". 