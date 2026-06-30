# tests/test_api.py
import requests, json, time

BASE_URL = 'http://127.0.0.1:8000/api'
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
RESET = '\033[0m'

# ── A test account used only for testing ──
TEST_EMAIL = 'tester@university.ac'
TEST_PASSWORD = 'TestPass123'
TEST_FIRST = 'Test'
TEST_LAST = 'User'

TOKEN = None   # will be filled in after login


def print_pass(t):
    print(f'{GREEN}PASS{RESET} - {t}')

def print_fail(t, r):
    print(f'{RED}FAIL{RESET} - {t}: {r}')

def section(t):
    print(f'\n{YELLOW}{"="*50}')
    print(t)
    print(f'{"="*50}{RESET}')


def get_auth_headers():
    """Returns headers with the auth token included."""
    return {'Authorization': f'Token {TOKEN}'} if TOKEN else {}


# ─── SETUP: Register or log in a test account ─────────────
def setup_auth():
    global TOKEN
    section('SETUP: Authenticate test account')
    try:
        # Try to register first
        r = requests.post(f'{BASE_URL}/auth/register/', json={
            'first_name': TEST_FIRST,
            'last_name': TEST_LAST,
            'email': TEST_EMAIL,
            'password': TEST_PASSWORD,
        }, timeout=15)

        if r.status_code == 201:
            TOKEN = r.json()['token']
            print_pass('Test account registered and token received')
            return

        # If already registered, log in instead
        r = requests.post(f'{BASE_URL}/auth/login/', json={
            'email': TEST_EMAIL,
            'password': TEST_PASSWORD,
        }, timeout=15)

        if r.status_code == 200:
            TOKEN = r.json()['token']
            print_pass('Test account logged in and token received')
        else:
            print_fail('Setup', f'Could not register or login: {r.text[:200]}')

    except Exception as e:
        print_fail('Setup', f'{type(e).__name__}: {e}')


def test_health():
    section('TEST 1: Health Check')
    try:
        r = requests.get(f'{BASE_URL}/health/', timeout=10)
        assert r.status_code == 200
        assert r.json()['status'] == 'ok'
        print_pass('Health returns 200 OK with status: ok')
    except Exception as e:
        print_fail('Health', f'{type(e).__name__}: {e}')


def test_valid_question():
    section('TEST 2: Valid Question')
    try:
        r = requests.post(
            f'{BASE_URL}/ask/',
            json={'question': 'How do I register?'},
            headers=get_auth_headers(),
            timeout=90
        )
        if r.status_code != 200:
            print_fail('Valid question', f'Expected 200, got {r.status_code}. Body: {r.text[:200]}')
            return
        data = r.json()
        if 'answer' not in data or len(data['answer']) <= 5:
            print_fail('Valid question', f'Bad answer: {data}')
            return
        print_pass(f'Got answer ({len(data["answer"])} chars)')
        print(f'  Answer preview: {data["answer"][:150]}...')
    except Exception as e:
        print_fail('Valid question', f'{type(e).__name__}: {e}')


def test_empty_question():
    section('TEST 3: Empty Question')
    try:
        r = requests.post(
            f'{BASE_URL}/ask/',
            json={'question': ''},
            headers=get_auth_headers(),
            timeout=15
        )
        if r.status_code != 400:
            print_fail('Empty question', f'Expected 400, got {r.status_code}. Body: {r.text[:200]}')
            return
        print_pass(f'Empty question returns 400: {r.json()["error"]}')
    except Exception as e:
        print_fail('Empty question', f'{type(e).__name__}: {e}')


def test_missing_field():
    section('TEST 4: Missing field')
    try:
        r = requests.post(
            f'{BASE_URL}/ask/',
            json={},
            headers=get_auth_headers(),
            timeout=15
        )
        if r.status_code != 400:
            print_fail('Missing field', f'Expected 400, got {r.status_code}. Body: {r.text[:200]}')
            return
        print_pass('Missing field returns 400')
    except Exception as e:
        print_fail('Missing field', f'{type(e).__name__}: {e}')


def test_multiple():
    section('TEST 5: Multiple Questions')
    qs = ['What are the library hours?', 'How do I pay fees?', 'What are exam rules?']
    for q in qs:
        try:
            r = requests.post(
                f'{BASE_URL}/ask/',
                json={'question': q},
                headers=get_auth_headers(),
                timeout=90
            )
            if r.status_code != 200:
                print_fail(q[:40], f'Status {r.status_code}: {r.text[:150]}')
                continue
            answer = r.json().get('answer', '')
            if len(answer) <= 5:
                print_fail(q[:40], f'Answer too short: "{answer}"')
                continue
            print_pass(f'{q[:40]}...')
            time.sleep(1)
        except Exception as e:
            print_fail(q[:40], f'{type(e).__name__}: {e}')


if __name__ == '__main__':
    print('\nIS 365 - API Tests')
    setup_auth()
    test_health()
    test_valid_question()
    test_empty_question()
    test_missing_field()
    test_multiple()
    print('\nTests complete.')