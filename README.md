# SpendWise 💸

A personal expense tracking application built with React and FastAPI.

## Features (MVP)

- ✅ Create, view, edit, delete expenses
- ✅ 10 preset categories (Food, Transport, Entertainment, Shopping, Bills, Health, Education, Games, Investment, Other)
- ✅ Dashboard with spending statistics (₹ INR)
- ✅ Search by description
- ✅ Filter by category and date range
- ✅ Responsive design

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, JavaScript |
| Backend | Python, FastAPI, Pydantic |
| Database | SQLite |

## Architecture

```
User's Browser
    │
    ▼
React Frontend (Vite :5173)
    │ HTTP/JSON
    ▼
FastAPI Backend (Uvicorn :8000)
    │
    ▼
SQLite Database
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+
- Git

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Project Status

🚧 Under Development — Building feature by feature as a learning project.

## License

MIT
