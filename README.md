# Login Page with PostgreSQL Backend 🚀

இந்த project-ல் ஒரு Modern Frontend Login Page மற்றும் Express.js + PostgreSQL Backend உள்ளது.
User login details-ஐ enter செய்யும்போது, அது PostgreSQL database-ல் உள்ள `login_records` table-ல் தானாக store ஆகும்.

---

## 📁 Folder Structure

```text
frontandback/
├── backend/
│   ├── .env               # Database connection settings
│   ├── .env.example       # Example environment variables
│   ├── db.js              # PostgreSQL connection & auto-table creation
│   ├── server.js          # Express API server (POST /api/login, GET /api/logins)
│   └── package.json       # Dependencies
└── frontend/
    ├── index.html         # Responsive & modern Login UI
    ├── style.css          # Glassmorphism styling
    └── app.js             # Connects frontend with backend API
```

---

## ⚙️ 1. PostgreSQL Configuration (`backend/.env`)

`backend/.env` file-ஐ open செய்து உங்களின் PostgreSQL details-ஐ கொடுக்கவும்:

```env
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=postgres
DB_PASSWORD=your_postgres_password
DB_PORT=5432
```

> **குறிப்பு (Note):** Table தானாகவே backend run ஆகும் போது உருவாக்கப்படும் (`CREATE TABLE IF NOT EXISTS login_records`). நீங்கள் தனியாக table create செய்ய வேண்டியதில்லை.

---

## 🚀 2. Backend Server-ஐ Run செய்வது எப்படி?

Terminal / Command Prompt-ல் பின்வரும் கட்டளைகளை இயக்கவும்:

```bash
cd backend
node server.js
```

Server வெற்றிகரமாக run ஆனால்:
```text
🚀 Server is running at: http://localhost:5000
🌐 Frontend can be viewed at: http://localhost:5000
✅ PostgreSQL: "login_records" table is ready.
```

---

## 💻 3. Frontend-ஐ பார்ப்பது எப்படி?

இரு வழிகளில் பார்க்கலாம்:
1. Browser-ல் நேரடியாக `http://localhost:5000` என்று திறக்கலாம் (Backend server மூலமாக).
2. அல்லது `frontend/index.html` file-ஐ இருமுறை கிளிக் செய்து எந்த browser-லும் திறக்கலாம்.

---

## 🔍 4. Stored Data-வை சரிபார்க்க:
- Web page-ல் உள்ள **"View PostgreSQL Records"** button-ஐ கிளிக் செய்து சேமிக்கப்பட்ட login details-ஐ நேரலையாகப் பார்க்கலாம்.
- அல்லது browser-ல் `http://localhost:5000/api/logins` என்ற URL-ஐ பார்க்கலாம்.
