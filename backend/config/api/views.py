# backend/api/views.py

import logging
import json
from django.utils import timezone
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authtoken.models import Token
from .llm_client import ask_llm

logger = logging.getLogger('api')


# ─────────────────────────────────────────────────────────────
# AUTH ENDPOINTS
# ─────────────────────────────────────────────────────────────

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """
    POST /api/auth/register/
    Body: { "first_name": "", "last_name": "", "email": "", "password": "" }
    Returns: { "token": "...", "user": { "id", "first_name", "last_name", "email" } }
    """
    first_name = request.data.get('first_name', '').strip()
    last_name  = request.data.get('last_name', '').strip()
    email      = request.data.get('email', '').strip().lower()
    password   = request.data.get('password', '')

    # ── Validation ──
    if not first_name:
        return Response({'error': 'First name is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if not last_name:
        return Response({'error': 'Last name is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if not email or '@' not in email:
        return Response({'error': 'A valid email is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if len(password) < 8:
        return Response({'error': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)

    # ── Check if email already registered ──
    if User.objects.filter(username=email).exists():
        return Response({'error': 'An account with this email already exists.'}, status=status.HTTP_400_BAD_REQUEST)

    # ── Create user ──
    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
    )

    # ── Create or get token ──
    token, _ = Token.objects.get_or_create(user=user)

    logger.info(f"New user registered: {email}")

    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
        }
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    """
    POST /api/auth/login/
    Body: { "email": "", "password": "" }
    Returns: { "token": "...", "user": { ... } }
    """
    email    = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '')

    if not email or not password:
        return Response({'error': 'Email and password are required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Django uses username field — we store email as username
    user = authenticate(username=email, password=password)

    if user is None:
        logger.warning(f"Failed login attempt for: {email}")
        return Response({'error': 'Incorrect email or password.'}, status=status.HTTP_401_UNAUTHORIZED)

    token, _ = Token.objects.get_or_create(user=user)

    logger.info(f"User logged in: {email}")

    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
        }
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    """
    POST /api/auth/logout/
    Header: Authorization: Token <token>
    Deletes the token so it can no longer be used.
    """
    try:
        request.user.auth_token.delete()
        logger.info(f"User logged out: {request.user.email}")
    except Exception:
        pass
    return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """
    GET /api/auth/me/
    Header: Authorization: Token <token>
    Returns the currently logged-in user's details.
    """
    user = request.user
    return Response({
        'id': user.id,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
    }, status=status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────
# EXISTING ENDPOINTS (now protected)
# ─────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    GET /api/health/
    Public — anyone can check if the server is running.
    """
    logger.info("Health check called")
    return Response({
        'status': 'ok',
        'message': 'University Student Support Assistant is running',
        'timestamp': timezone.now().isoformat(),
        'model': 'llama3.2:1b'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])   # ← PROTECTED: must be logged in
def ask_question(request):
    """
    POST /api/ask/
    Header: Authorization: Token <token>
    Body:   { "question": "..." }
    Returns: { "question": "...", "answer": "...", "timestamp": "..." }
    """
    question = request.data.get('question', '').strip()

    if not question:
        return Response(
            {'error': 'Please enter a question before submitting.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(question) > 1000:
        return Response(
            {'error': 'Question is too long. Keep it under 1000 characters.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    logger.info(f"Question from {request.user.email}: {question}")

    try:
        answer = ask_llm(question)
        logger.info(f"Answer generated for {request.user.email}: {answer[:100]}...")
        return Response({
            'question': question,
            'answer': answer,
            'timestamp': timezone.now().isoformat()
        }, status=status.HTTP_200_OK)

    except ConnectionError as e:
        logger.error(f"Ollama connection error: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
    except TimeoutError as e:
        logger.error(f"Ollama timeout: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_504_GATEWAY_TIMEOUT)
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return Response(
            {'error': 'An unexpected error occurred. Please try again.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
