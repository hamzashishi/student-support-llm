# University Student Support Assistant
IS 365 - Practical Assignment

## Overview
A full-stack LLM application that helps university students ask questions
about university services, built with Django and React.

## Requirements
- Python 3.10+
- Node.js 18+
- Ollama (https://ollama.com)

## Setup Instructions

### 1. Set up Python environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

### 2. Install and start the LLM
ollama pull llama3.2:1b
ollama serve

### 3. Start the Django backend
cd backend
python manage.py migrate
python manage.py runserver
# Runs at http://127.0.0.1:8000

### 4. Start the React frontend
cd frontend
npm install
npm start
# Opens at http://localhost:3000

## API Endpoints
GET  /api/health/   Check backend status
POST /api/ask/      Ask a question ({question: string})

## Run Tests
python tests/test_api.py
