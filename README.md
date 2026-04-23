# Backend - SaaS-CRM-система

Базовый CRM backend на `Express.js` + `TypeScript` + `Prisma`.

## Стек

- Express.js
- TypeScript
- Prisma ORM + PostgreSQL
- JWT (`access` / `refresh`)
- Zod (валидация входных данных)

## Установка и запуск

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

## Переменные окружения

Создай `.env` в корне проекта:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DB"
JWT_ACCESS_SECRET="your_access_secret_min_8_chars"
JWT_REFRESH_SECRET="your_refresh_secret_min_8_chars"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="http://localhost:3000"
```

## npm scripts

- `npm run dev` - запуск в режиме разработки (`tsx watch`)
- `npm run build` - сборка TypeScript в `dist`
- `npm run start` - запуск собранного приложения
- `npm run prisma:generate` - генерация Prisma Client
- `npm run prisma:migrate` - миграции для разработки
- `npm run prisma:deploy` - применение миграций в production

## Структура проекта

- `src/app.ts` - конфигурация Express и подключение роутов
- `src/server.ts` - запуск HTTP-сервера
- `src/module/*` - модули бизнес-логики
- `src/middlewares/*` - middleware (auth, tenant, role, validate, pagination, error-handler)
- `prisma/schema.prisma` - схема базы данных

## API маршруты

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Clients

- `POST /api/clients`
- `GET /api/clients`
- `GET /api/clients/:id`
- `PATCH /api/clients/:id`
- `DELETE /api/clients/:id`

### Companies

- `GET /api/companies/current`
- `PATCH /api/companies/current` (`ADMIN`)

### Deals

- `POST /api/deals`
- `GET /api/deals`
- `GET /api/deals/:id`
- `PATCH /api/deals/:id`
- `DELETE /api/deals/:id`

### Invoices

- `POST /api/invoices`
- `GET /api/invoices`
- `GET /api/invoices/:id`
- `PATCH /api/invoices/:id`
- `DELETE /api/invoices/:id`

### Tasks

- `POST /api/tasks`
- `GET /api/tasks`
- `GET /api/tasks/:id`
- `PATCH /api/tasks/:id`
- `DELETE /api/tasks/:id`

### Profiles

- `GET /api/profiles/me`
- `PATCH /api/profiles/me`
- `GET /api/profiles/team`
