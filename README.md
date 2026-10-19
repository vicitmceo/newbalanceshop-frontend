# New Balance Shop: фронтенд

> Інтернет-магазин спортивного взуття, одягу та аксесуарів у стилі newbalance.com. Курсовий командний проєкт Team 1. React 19 + Vite, три мови (UA / EN / FR).

| | Посилання |
|---|---|
| 🌐 Сайт | https://newbalance.cc.cd |
| 🧩 Бекенд (репозиторій) | https://github.com/vicitmceo/NewBalanceShop |
| 🧪 Swagger API | https://newbalanceshop-api.onrender.com/swagger |
| 📚 Документація API (Scalar) | https://vicitmceo.github.io/NewBalanceShop/api/ |
| 📘 Документація коду (DocFX) | https://vicitmceo.github.io/NewBalanceShop/code/ |
| 🗂️ Jira (Scrum) | https://newbalance-team1.atlassian.net/jira/software/projects/SCRUM/boards/1/backlog |

## ✨ Можливості

- Каталог: розділи Чоловікам / Жінкам / Дітям / Розпродаж / Новинки, 70 товарів
- Фільтри в адресі (можна поділитися посиланням): стать, категорія, тип, розмір, ціна, сортування, пошук
- Картка товару: галерея до 4 фото, вибір розміру, стара й нова ціна для знижок
- Кошик, оформлення замовлення, обране, історія замовлень, кабінет
- Реєстрація та вхід (email + пароль, Google через Firebase)
- Адмін-панель: користувачі, товари, замовлення
- Адаптивна верстка, UA / EN / FR

## 🛠️ Технології

React 19, Vite, react-router-dom 7, i18next, Firebase Auth (Google). Запити на `/api/...` проксуються Vercel на сервер (сесійна кука першої сторони).

## 🚀 Запуск

```bash
npm install
npm run dev      # http://localhost:5173, /api проксується у vite.config.js
npm run build
npm run lint
```

Змінні (`.env.example`): `VITE_API_URL`, `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`. Секрети в репозиторії не зберігаються.

## 📦 Каталог

Дані й фото: `scripts/nb_catalog.json`, `public/images/nb/`. Завантаження в API виконує `scripts/seed_catalog.py` з репозиторію бекенду.

## 👨‍💻 Автори

Панчук Вадим Владиславович (Team Lead), Ноцколіні Рафаїл Львович (full-stack).

## ⚖️ Примітка

Навчальний проєкт. Магазин не пов'язаний із New Balance; назви товарів і фотографії належать їхнім власникам.
