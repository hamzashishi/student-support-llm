#  University Student Support Assistant

# IS 365 — Practical Assignment
Full-Stack Pipeline for Deploying a Self-Hosted LLM Application

A complete AI-powered support assistant that helps university students with questions about course registration, 
exam rules, library services, ICT support, hostel applications, fee payment, the academic calendar, and
student conduct — built with **Django**, **React**, and a locally hosted **Llama 3.2** model via **Ollama**.

--------------------------------------------------------------------------------------------------------------

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Setup Instructions](#-setup-instructions)
- [Running the Project](#-running-the-project)
- [API Endpoints](#-api-endpoints)
- [Authentication](#-authentication)
- [Testing](#-testing)
- [Logging](#-logging)
- [Error Handling](#-error-handling)
- [Screenshots](#-screenshots)
- [Team](#-team)
-----------------------------------------------------------------------------------------------------------------------
## Features

-  Chat-style interface for asking university-related questions
- User authentication (sign up, log in, log out) with token-based security
- Local LLM (Llama 3.2) — no external API costs, full data privacy
- Real-time responses with loading indicators
- Input validation and graceful error handling
- Full request/response logging
- Automated test suite + Postman collection
-----------------------------------------------------------------------------------------------------------------------
## Tech Stack

| Layer |                     | Technology |

| Frontend |    ----->        | React |
| Backend |      ----->       | Django + Django REST Framework |
| Authentication | ----->     | DRF Token Authentication |
| LLM Serving |   ----->      |Ollama (llama3.2:1b) |
| Database |      ----->      |SQLite |
| Testing |       ----->      |Python `requests` + Postman |
-----------------------------------------------------------------------------------------------------------------------
##  Project Structure

student-support-llm/
├── backend/
│   ├── manage.py
│   ├── config/              # Django settings, URLs
│   ├── api/                 # Views, URLs, LLM client
│   └── logs/                # app.log (generated at runtime)
├── frontend/
│   ├── public/
│   └── src/
│       ├── App.jsx
│       └── components/      # AuthPage, ChatBox, MessageBubble, etc.
├── tests/
│   ├── test_api.py
│   └── IS365-postman-collection.json
├── docs/
│   ├── screenshots/
│   └── report.md
├── requirements.txt
└── README.md

-----------------------------------------------------------------------------------------------------------------------
## Prerequisites

This is prerequisites to make sure you have:

- **Python 3.10+** 
- **Node.js 18+** 
- **Ollama** 
- **Git** 
-----------------------------------------------------------------------------------------------------------------------
## Setup Instructions

### 1. Clone the repository

bash
git clone https://github.com/hamzashishi/student-support-llm.git
cd student-support-llm


### 2. Set up the Python virtual environment

bash
python -m venv venv


**Windows:**
bash
venv\Scripts\activate


### 3. Install backend dependencies
bash
pip install -r requirements.txt


### 4. Install and run the local LLM
bash
ollama pull llama3.2:1b
ollama serve

### 5. Set up the Django backend
bash
cd backend
python manage.py migrate

### 6. Install frontend dependencies
bash
cd ../frontend
npm install


### 7. Create the frontend environment file
Create  frontend/.env
REACT_APP_API_URL=http://127.0.0.1:8000/api


-----------------------------------------------------------------------------------------------------------------------
## Running the Project

You need **3 terminals open at the same time**:

**Terminal 1 — Ollama**
bash
ollama serve


**Terminal 2 — Django backend**
bash
cd backend
venv\Scripts\activate
python manage.py runserver

Runs at: `http://127.0.0.1:8000`

**Terminal 3 — React frontend**
bash
cd frontend
npm start

Runs at: `http://localhost:3000`
-----------------------------------------------------------------------------------------------------------------------
## API Endpoints

| GET | `/api/health/` |  Check if the backend is running |
| POST | `/api/auth/register/` |  Create a new account |
| POST | `/api/auth/login/` |  Log in and receive a token |
| POST | `/api/auth/logout/` |  Invalidate the current token |
| GET | `/api/auth/me/` | Get the current logged-in user |
| POST | `/api/ask/` | Ask the assistant a question |

-----------------------------------------------------------------------------------------------------------------------
## Authentication

This project uses **token-based authentication**.

1. Register or log in via `/api/auth/register/` or `/api/auth/login/`
2. You'll receive a `token` in the response
3. Include it in the header of every protected request:
-----------------------------------------------------------------------------------------------------------------------
## Testing

### Automated Python test script
```bash
python tests/test_api.py
```Runs 5 automated tests: health check, valid question, empty question, missing field, and multiple sequential questions.
```
### Postman Collection

A ready-to-import collection is provided at `tests/IS365-postman-collection.json`.

-----------------------------------------------------------------------------------------------------------------------
## Logging

Every question, answer, warning, and error is logged to:
```
backend/logs/app.log
```

View it with:
```bash
type backend\logs\app.log      
```
-----------------------------------------------------------------------------------------------------------------------
##  Error Handling

| Situation               ----->                Behaviour 

| Backend not running     ----->     Frontend shows a connection error banner 
| Ollama not running      ----->     Backend returns a clear 503 error 
| Empty question          ----->     Frontend/backend rejects with a validation message 
| Slow response           ----->     Frontend shows a loading spinner 
| Invalid/expired token   ----->     Backend returns 401, frontend redirects to login 

-----------------------------------------------------------------------------------------------------------------------
## Screenshots

See `docs/screenshots/` for evidence of:
- Virtual environment setup
- Ollama model running
- Django backend running
- Frontend login and chat interface
- Sample question and answer
- Test script output
- Log file contents

-----------------------------------------------------------------------------------------------------------------------
##  Team

 Name -----> Role 

SAID HAMZA SHISHI   ----->    Backend (Django) |
THOMAS SAKAWA       ----->   Frontend (React) |
                    ----->   LLM integration |
                    ----->   Testing |
                    ----->   Documentation / Report |


