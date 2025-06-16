<h1 align="center">
    🎓 ENHANCED SCHOOL MANAGEMENT SYSTEM
</h1>

<h3 align="center">
Полнофункциональная система управления школой с расширенными возможностями<br>
Управление классами, студентами, учителями, заявками и уведомлениями в реальном времени<br>
Современный дизайн, безопасность и производительность
</h3>

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-green.svg)
![React](https://img.shields.io/badge/react-18.x-blue.svg)
![MongoDB](https://img.shields.io/badge/mongodb-7.x-green.svg)
![License](https://img.shields.io/badge/license-ISC-yellow.svg)

</div>

## 🚀 Новые возможности в версии 2.0

### ✨ Основные улучшения
- **JWT Аутентификация** - Безопасная система входа с токенами
- **Система заявок учителей** - Подача и обработка заявок от учителей
- **Уведомления в реальном времени** - Socket.IO интеграция
- **Улучшенная безопасность** - Rate limiting, валидация, логирование
- **Каскадное удаление** - Безопасное удаление связанных данных
- **Расширенная аналитика** - Детальная статистика и отчеты

### 🔧 Технические улучшения
- **Middleware безопасности** - Helmet, CORS, валидация
- **Логирование** - Winston для отслеживания всех действий
- **Обработка ошибок** - Централизованная система ошибок
- **Валидация данных** - Express-validator для всех endpoints
- **Оптимизация БД** - Индексы и агрегация MongoDB

## 📋 Функциональность

### 👨‍💼 Администратор
- ✅ Управление студентами, учителями, классами и предметами
- ✅ Просмотр и обработка заявок от учителей
- ✅ Создание и управление уведомлениями
- ✅ Детальная аналитика и статистика
- ✅ Управление расписанием и экзаменами
- ✅ Система безопасности и логирования

### 👨‍🏫 Учитель
- ✅ Подача заявок (изменение расписания, новые предметы, отпуск)
- ✅ Управление посещаемостью и оценками
- ✅ Получение уведомлений о статусе заявок
- ✅ Просмотр расписания и классов
- ✅ Коммуникация с администрацией

### 👨‍🎓 Студент
- ✅ Просмотр оценок и посещаемости
- ✅ Получение уведомлений об изменениях
- ✅ Просмотр расписания и объявлений
- ✅ Визуализация успеваемости
- ✅ Подача жалоб и обращений

## 🛠 Технологии

### Backend
- **Node.js** - Серверная среда выполнения
- **Express.js** - Web-фреймворк
- **MongoDB** - NoSQL база данных
- **Mongoose** - ODM для MongoDB
- **JWT** - Аутентификация
- **Socket.IO** - Реальное время
- **Winston** - Логирование
- **Helmet** - Безопасность
- **Express-validator** - Валидация

### Frontend
- **React.js** - UI библиотека
- **Material-UI** - Компоненты дизайна
- **Redux** - Управление состоянием
- **Socket.IO Client** - Реальное время
- **Axios** - HTTP клиент

## 📦 Установка

### Предварительные требования
- Node.js >= 16.0.0
- MongoDB >= 5.0
- npm >= 8.0.0

### 1. Клонирование репозитория
```bash
git clone https://github.com/your-repo/enhanced-school-management.git
cd enhanced-school-management
```

### 2. Установка зависимостей
```bash
# Установка всех зависимостей
npm run install-all

# Или по отдельности
npm run install-server
npm run install-client
```

### 3. Настройка переменных окружения

#### Backend (.env)
```env
# Database
MONGO_URI=mongodb://127.0.0.1:27017/school
MONGODB_URI=mongodb://127.0.0.1:27017/school

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production_2024
JWT_EXPIRES_IN=7d

# CORS
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Admin
DEFAULT_ADMIN_EMAIL=admin@school.com
DEFAULT_ADMIN_PASSWORD=admin123
DEFAULT_ADMIN_NAME=System Administrator
```

#### Frontend (.env)
```env
REACT_APP_BASE_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
REACT_APP_API_VERSION=v2
REACT_APP_APP_NAME=School Management System
REACT_APP_ENVIRONMENT=development
GENERATE_SOURCEMAP=false
```

### 4. Запуск приложения
```bash
# Запуск в режиме разработки
npm run dev

# Или по отдельности
npm run server  # Backend на порту 5000
npm run client  # Frontend на порту 3000
```

## 🔐 Данные для входа

### Администратор (создается автоматически)
- **Email:** admin@school.com
- **Пароль:** admin123
- **Роль:** SuperAdmin

### Создание тестовых данных
```bash
cd backend
npm run seed
```

## 📚 API Документация

### Основные endpoints

#### Аутентификация
- `POST /AdminLogin` - Вход администратора
- `POST /TeacherLogin` - Вход учителя
- `POST /StudentLogin` - Вход студента

#### Заявки учителей
- `GET /teacher-requests` - Получить все заявки (админ)
- `POST /teacher-requests` - Создать заявку (учитель)
- `POST /teacher-requests/:id/approve` - Одобрить заявку (админ)
- `POST /teacher-requests/:id/reject` - Отклонить заявку (админ)

#### Уведомления
- `GET /notifications` - Получить уведомления пользователя
- `GET /notifications/unread-count` - Количество непрочитанных
- `PATCH /notifications/:id/read` - Отметить как прочитанное
- `POST /notifications/bulk-operations` - Массовые операции

#### Утилиты
- `GET /health` - Проверка здоровья API
- `GET /api-info` - Информация об API

## 🔧 Разработка

### Структура проекта
```
├── backend/
│   ├── controllers/         # Контроллеры
│   ├── middleware/         # Middleware
│   ├── models/            # Модели MongoDB
│   ├── routes/            # Маршруты API
│   ├── uploads/           # Загруженные файлы
│   ├── logs/              # Логи приложения
│   └── index.js           # Точка входа
├── frontend/
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── pages/         # Страницы
│   │   ├── redux/         # Redux store
│   │   └── context/       # React Context
│   └── public/
└── README.md
```

### Команды разработки
```bash
# Backend
npm run dev          # Запуск с nodemon
npm run logs         # Просмотр логов
npm run seed         # Создание тестовых данных

# Frontend
npm start            # Запуск React приложения
npm run build        # Сборка для production
```

## 🚀 Деплой

### Production настройки
1. Установите переменные окружения для production
2. Настройте MongoDB Atlas или локальную БД
3. Настройте HTTPS и SSL сертификаты
4. Используйте PM2 для управления процессами

```bash
# Сборка frontend
cd frontend && npm run build

# Запуск backend в production
cd backend && NODE_ENV=production npm start
```

## 🔒 Безопасность

### Реализованные меры
- JWT токены с истечением срока действия
- Rate limiting для API endpoints
- Валидация всех входящих данных
- Helmet для безопасности заголовков
- CORS настройки
- Логирование подозрительной активности
- Хэширование паролей с bcrypt

## 📊 Мониторинг

### Логирование
- Все действия пользователей логируются
- Ошибки сохраняются в отдельный файл
- Подозрительная активность отслеживается

### Файлы логов
- `logs/combined.log` - Все логи
- `logs/error.log` - Только ошибки

## 🤝 Вклад в проект

1. Fork репозитория
2. Создайте feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit изменения (`git commit -m 'Add some AmazingFeature'`)
4. Push в branch (`git push origin feature/AmazingFeature`)
5. Откройте Pull Request

## 📝 Лицензия

Этот проект лицензирован под ISC License.

## 🆘 Поддержка

Если у вас возникли проблемы:

1. Проверьте логи в `backend/logs/`
2. Убедитесь, что MongoDB запущена
3. Проверьте переменные окружения
4. Откройте issue в GitHub

## 📞 Контакты

- **Email:** support@schoolmanagement.com
- **GitHub:** [Repository Issues](https://github.com/your-repo/issues)

---

<div align="center">
Made with ❤️ for educational institutions worldwide
</div>

