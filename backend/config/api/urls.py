# backend/api/urls.py

from django.urls import path
from . import views

urlpatterns = [
    # ── Public ──────────────────────────────────────────────
    path('health/',        views.health_check, name='health-check'),

    # ── Auth ────────────────────────────────────────────────
    path('auth/register/', views.register,     name='register'),
    path('auth/login/',    views.login,         name='login'),
    path('auth/logout/',   views.logout,        name='logout'),
    path('auth/me/',       views.me,            name='me'),

    # ── Protected ───────────────────────────────────────────
    path('ask/',           views.ask_question,  name='ask-question'),
]
