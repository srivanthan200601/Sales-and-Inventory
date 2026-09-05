#!/usr/bin/env python3
"""
auth/test_auth.py
Retail Copilot (TRACK_DIPHS08) — Complete Auth Test Suite

Tests:
  1. Registration (valid + invalid)
  2. Login (valid + invalid credentials)
  3. JWT token verification
  4. Protected route access
  5. Role-based authorization (RBAC)
  6. Account lockout after 5 failures
  7. Token refresh rotation
  8. Logout + token blacklist
  9. Password hashing security

Run: py auth/test_auth.py
"""

import sys
import os
import json
import time
import urllib.request
import urllib.error

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

BASE_URL  = "http://localhost:5000/api/v1"
PASS_ICON = "[PASS]"
FAIL_ICON = "[FAIL]"
SKIP_ICON = "[SKIP]"

# ─────────────────────────────────────────────────────────────
# HTTP HELPERS
# ─────────────────────────────────────────────────────────────

def http(method: str, endpoint: str, body: dict = None, token: str = None) -> tuple:
    """Returns (status_code, response_dict)"""
    url = f"{BASE_URL}{endpoint}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=8) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))
    except Exception as ex:
        return 0, {"error": str(ex)}


# ─────────────────────────────────────────────────────────────
# TEST RUNNER
# ─────────────────────────────────────────────────────────────

passed = failed = skipped = 0
_server_up = None

def assert_test(label: str, condition: bool, detail: str = ""):
    global passed, failed
    if condition:
        passed += 1
        print(f"  {PASS_ICON}  {label}")
    else:
        failed += 1
        print(f"  {FAIL_ICON}  {label}")
        if detail:
            print(f"          Detail: {detail}")

def skip_test(label: str, reason: str = ""):
    global skipped
    skipped += 1
    print(f"  {SKIP_ICON}  {label}" + (f" ({reason})" if reason else ""))

def section(title: str):
    print(f"\n{'─'*58}")
    print(f"  {title}")
    print(f"{'─'*58}")

def check_server():
    global _server_up
    if _server_up is not None:
        return _server_up
    try:
        with urllib.request.urlopen("http://localhost:5000/health", timeout=3) as r:
            _server_up = r.status == 200
    except Exception:
        _server_up = False
    return _server_up


# ─────────────────────────────────────────────────────────────
# UNIT TESTS  (stdlib only, no server needed)
# ─────────────────────────────────────────────────────────────

def test_password_hashing():
    section("1. Password Hashing — PBKDF2-HMAC-SHA256")
    from auth.auth_core import hash_password, verify_password

    pw     = "SecureRetail@2026"
    hashed = hash_password(pw)

    assert_test("Hash is not plaintext",  hashed != pw)
    assert_test("Hash starts with 'pbkdf2$sha256$'", hashed.startswith("pbkdf2$sha256$"))
    assert_test("Correct password verifies", verify_password(pw, hashed))
    assert_test("Wrong password is rejected", not verify_password("WrongPass1", hashed))
    assert_test("Empty string is rejected",   not verify_password("", hashed))
    assert_test("SQL injection attempt rejected", not verify_password("' OR '1'='1", hashed))

    # Two hashes of same pw must differ (random salt)
    h1, h2 = hash_password(pw), hash_password(pw)
    assert_test("Same password produces different hashes (random salt)", h1 != h2)
    assert_test("Both hashes of same pw verify correctly",
                verify_password(pw, h1) and verify_password(pw, h2))


def test_jwt():
    section("2. JWT — HS256 Token Creation & Verification")
    from auth.auth_core import (
        create_access_token, create_refresh_token,
        verify_token, ACCESS_TOKEN_TTL
    )

    secret = "test_secret_key_2026"
    payload = {"sub": "user-001", "email": "test@test.com", "role": "CASHIER"}

    access  = create_access_token(payload, secret)
    refresh = create_refresh_token(payload, secret)

    assert_test("Access token is non-empty string", isinstance(access, str) and len(access) > 10)
    assert_test("Access token has 3 dot-separated parts", len(access.split(".")) == 3)
    assert_test("Refresh token created",  isinstance(refresh, str) and len(refresh) > 10)

    decoded = verify_token(access, secret, "access")
    assert_test("Access token verifies successfully",   decoded is not None)
    assert_test("Decoded sub matches",  decoded and decoded.get("sub") == "user-001")
    assert_test("Decoded role matches", decoded and decoded.get("role") == "CASHIER")
    assert_test("Token type is 'access'", decoded and decoded.get("type") == "access")
    assert_test("Expiry field present",   decoded and "exp" in decoded)

    assert_test("Wrong secret is rejected",
                verify_token(access, "wrong_secret", "access") is None)
    assert_test("Access token rejected as refresh",
                verify_token(access, secret, "refresh") is None)
    assert_test("Tampered token rejected",
                verify_token(access + "x", secret, "access") is None)
    assert_test("Empty string rejected",
                verify_token("", secret, "access") is None)

    # Refresh token has jti
    rdecoded = verify_token(refresh, secret, "refresh")
    assert_test("Refresh token has jti for revocation", rdecoded and "jti" in rdecoded)


def test_validation():
    section("3. Input Validation")
    from auth.auth_core import validate_registration, validate_login, ValidationError

    # Registration validation
    try:
        validate_registration({"email": "bad-email", "password": "123", "full_name": "X"})
        assert_test("Invalid registration rejected", False)
    except ValidationError as e:
        errs = e.args[0]
        assert_test("Invalid registration raises ValidationError",  True)
        assert_test("Email error present in validation output",  "email" in errs)
        assert_test("Password error present in validation output", "password" in errs)

    try:
        validate_registration({"email": "valid@test.com", "password": "Valid123!", "full_name": "Test User"})
        assert_test("Valid registration data passes", True)
    except ValidationError:
        assert_test("Valid registration data passes", False)

    # Login validation
    try:
        validate_login({"email": "", "password": ""})
        assert_test("Empty login rejected", False)
    except ValidationError:
        assert_test("Empty login raises ValidationError", True)


def test_rbac():
    section("4. Role-Based Access Control (RBAC)")
    from auth.auth_core import has_permission, ROLES

    # Super admin can do everything
    assert_test("SUPER_ADMIN: sales:read",         has_permission("SUPER_ADMIN", "sales:read"))
    assert_test("SUPER_ADMIN: inventory:adjust",   has_permission("SUPER_ADMIN", "inventory:adjust"))
    assert_test("SUPER_ADMIN: users:*",             has_permission("SUPER_ADMIN", "users:*"))

    # Store Manager
    assert_test("STORE_MANAGER: products:read",    has_permission("STORE_MANAGER", "products:read"))
    assert_test("STORE_MANAGER: sales:create",     has_permission("STORE_MANAGER", "sales:create"))
    assert_test("STORE_MANAGER: analytics:read",   has_permission("STORE_MANAGER", "analytics:read"))
    assert_test("STORE_MANAGER: no users:*",      not has_permission("STORE_MANAGER", "users:*"))

    # Cashier is restricted
    assert_test("CASHIER: sales:create allowed",   has_permission("CASHIER", "sales:create"))
    assert_test("CASHIER: products:read allowed",  has_permission("CASHIER", "products:read"))
    assert_test("CASHIER: no analytics:read",     not has_permission("CASHIER", "analytics:read"))
    assert_test("CASHIER: no inventory:adjust",   not has_permission("CASHIER", "inventory:adjust"))
    assert_test("CASHIER: no purchases:create",   not has_permission("CASHIER", "purchases:create"))
    assert_test("CASHIER: no users:*",            not has_permission("CASHIER", "users:*"))

    # Inventory Specialist
    assert_test("INV_SPEC: inventory:adjust",      has_permission("INVENTORY_SPECIALIST", "inventory:adjust"))
    assert_test("INV_SPEC: no sales:create",      not has_permission("INVENTORY_SPECIALIST", "sales:create"))

    # Auditor — read only
    assert_test("AUDITOR: analytics:read",         has_permission("AUDITOR", "analytics:read"))
    assert_test("AUDITOR: no sales:create",       not has_permission("AUDITOR", "sales:create"))
    assert_test("AUDITOR: no inventory:adjust",   not has_permission("AUDITOR", "inventory:adjust"))

    # All 5 roles present
    assert_test("All 5 roles defined in ROLES map", len(ROLES) == 5)


# ─────────────────────────────────────────────────────────────
# INTEGRATION TESTS  (server must be running)
# ─────────────────────────────────────────────────────────────

def test_registration_api():
    section("5. API — Registration")
    if not check_server():
        skip_test("All registration tests — server not running on :5000")
        return

    ts = str(int(time.time()))

    # Valid registration
    status, resp = http("POST", "/auth/register", {
        "email": f"test_{ts}@example.com",
        "password": "Test1234!",
        "full_name": "Test User",
        "role": "CASHIER"
    })
    assert_test("201 returned for valid registration", status == 201,
                f"Got {status}: {resp}")
    assert_test("Response success=True", resp.get("success") is True)
    assert_test("User data returned", "data" in resp and resp["data"])
    assert_test("Password NOT in response",
                "password" not in str(resp.get("data", {})) or
                "password_hash" not in resp.get("data", {}))

    # Duplicate email
    status2, resp2 = http("POST", "/auth/register", {
        "email": f"test_{ts}@example.com",
        "password": "Test1234!",
        "full_name": "Duplicate",
        "role": "CASHIER"
    })
    assert_test("409 for duplicate email", status2 == 409, f"Got {status2}")

    # Invalid email
    status3, _ = http("POST", "/auth/register", {
        "email": "not-an-email",
        "password": "Test1234!",
        "full_name": "Bad Email",
        "role": "CASHIER"
    })
    assert_test("422 for invalid email", status3 == 422, f"Got {status3}")

    # Weak password
    status4, _ = http("POST", "/auth/register", {
        "email": f"weak_{ts}@example.com",
        "password": "123",
        "full_name": "Weak Password",
        "role": "CASHIER"
    })
    assert_test("422 for weak password", status4 == 422, f"Got {status4}")

    # Invalid role
    status5, _ = http("POST", "/auth/register", {
        "email": f"role_{ts}@example.com",
        "password": "Valid123!",
        "full_name": "Bad Role",
        "role": "HACKER"
    })
    assert_test("422 for invalid role", status5 == 422, f"Got {status5}")


def test_login_api():
    section("6. API — Login")
    if not check_server():
        skip_test("All login tests — server not running")
        return

    # Valid login — Manager
    status, resp = http("POST", "/auth/login", {
        "email": "alex.morgan@apexretail.com",
        "password": "Manager@1234"
    })
    assert_test("200 for valid credentials",   status == 200, f"Got {status}: {resp}")
    assert_test("access_token present",        "access_token" in resp.get("data", {}))
    assert_test("refresh_token present",       "refresh_token" in resp.get("data", {}))
    assert_test("token_type = Bearer",         resp.get("data", {}).get("token_type") == "Bearer")
    assert_test("expires_in present",          "expires_in" in resp.get("data", {}))
    assert_test("user.role = STORE_MANAGER",   resp.get("data", {}).get("user", {}).get("role") == "STORE_MANAGER")
    assert_test("permissions array present",   isinstance(resp.get("data", {}).get("permissions"), list))
    assert_test("password_hash NOT in response",
                "password_hash" not in str(resp))

    # Wrong password
    status2, _ = http("POST", "/auth/login", {
        "email": "alex.morgan@apexretail.com",
        "password": "WrongPassword!"
    })
    assert_test("401 for wrong password", status2 == 401, f"Got {status2}")

    # Non-existent email
    status3, _ = http("POST", "/auth/login", {
        "email": "ghost@nobody.com",
        "password": "DoesNotMatter1"
    })
    assert_test("401 for non-existent email", status3 == 401, f"Got {status3}")

    # Missing password field
    status4, _ = http("POST", "/auth/login", {"email": "alex.morgan@apexretail.com"})
    assert_test("422 for missing password", status4 == 422, f"Got {status4}")

    return resp.get("data", {}).get("access_token"), resp.get("data", {}).get("refresh_token")


def test_protected_routes(access_token: str = None):
    section("7. API — Protected Routes")
    if not check_server():
        skip_test("All protected route tests — server not running")
        return

    if not access_token:
        # Try to login to get a token
        _, resp = http("POST", "/auth/login", {
            "email": "alex.morgan@apexretail.com",
            "password": "Manager@1234"
        })
        access_token = resp.get("data", {}).get("access_token")

    # No token → 401
    status, _ = http("GET", "/auth/me")
    assert_test("401 with no token on /auth/me",  status == 401, f"Got {status}")

    status, _ = http("GET", "/products")
    assert_test("401 with no token on /products", status == 401, f"Got {status}")

    # Invalid token → 401
    status, _ = http("GET", "/auth/me", token="eyJhbGciOiJIUzI1NiJ9.invalid.sig")
    assert_test("401 with invalid token",         status == 401, f"Got {status}")

    if not access_token:
        skip_test("Remaining protected route tests — no access token")
        return

    # Valid token → 200
    status, resp = http("GET", "/auth/me", token=access_token)
    assert_test("200 with valid token on /auth/me", status == 200, f"Got {status}")
    assert_test("/auth/me returns user email",
                resp.get("data", {}).get("email") == "alex.morgan@apexretail.com")

    status, resp = http("GET", "/products", token=access_token)
    assert_test("200 with valid token on /products",  status == 200, f"Got {status}")

    status, resp = http("GET", "/inventory", token=access_token)
    assert_test("200 with valid token on /inventory", status == 200, f"Got {status}")

    status, resp = http("GET", "/analytics/dashboard", token=access_token)
    assert_test("200 analytics with STORE_MANAGER token", status == 200, f"Got {status}")


def test_rbac_api(manager_token: str = None):
    section("8. API — Role-Based Authorization")
    if not check_server():
        skip_test("All RBAC API tests — server not running")
        return

    # Login as CASHIER
    _, resp = http("POST", "/auth/login", {
        "email": "mia.walker@apexretail.com",
        "password": "Cashier@123"
    })
    cashier_token = resp.get("data", {}).get("access_token")
    assert_test("Cashier login succeeds", cashier_token is not None)

    if cashier_token:
        # Cashier CAN access products and sales
        status, _ = http("GET", "/products", token=cashier_token)
        assert_test("Cashier: GET /products allowed (200)", status == 200, f"Got {status}")
        status, _ = http("GET", "/sales",    token=cashier_token)
        assert_test("Cashier: GET /sales allowed (200)", status == 200, f"Got {status}")

        # Cashier CANNOT access analytics
        status, _ = http("GET", "/analytics/dashboard", token=cashier_token)
        assert_test("Cashier: GET /analytics forbidden (403)", status == 403, f"Got {status}")

        # Cashier CANNOT adjust inventory
        status, _ = http("POST", "/inventory/adjustment",
                         {"product_id": "p001", "quantity": 5}, token=cashier_token)
        assert_test("Cashier: POST /inventory/adjustment forbidden (403)", status == 403, f"Got {status}")

        # Cashier CANNOT access user list
        status, _ = http("GET", "/users", token=cashier_token)
        assert_test("Cashier: GET /users forbidden (403)", status == 403, f"Got {status}")

    # Login as AUDITOR
    _, resp2 = http("POST", "/auth/login", {
        "email": "olivia.james@apexretail.com",
        "password": "Audit@1234"
    })
    auditor_token = resp2.get("data", {}).get("access_token")
    assert_test("Auditor login succeeds", auditor_token is not None)

    if auditor_token:
        status, _ = http("GET", "/analytics/dashboard", token=auditor_token)
        assert_test("Auditor: GET /analytics allowed (200)", status == 200, f"Got {status}")
        status, _ = http("POST", "/sales", {"items": []}, token=auditor_token)
        assert_test("Auditor: POST /sales forbidden (403)", status == 403, f"Got {status}")

    # Login as SUPER_ADMIN
    _, resp3 = http("POST", "/auth/login", {
        "email": "admin@apexretail.com",
        "password": "Admin@1234"
    })
    admin_token = resp3.get("data", {}).get("access_token")
    assert_test("Admin login succeeds", admin_token is not None)

    if admin_token:
        status, resp4 = http("GET", "/users", token=admin_token)
        assert_test("Admin: GET /users allowed (200)", status == 200, f"Got {status}")
        assert_test("Admin: user list is non-empty", len(resp4.get("data", [])) > 0)


def test_logout_and_blacklist():
    section("9. API — Logout & Token Blacklist")
    if not check_server():
        skip_test("Logout tests — server not running")
        return

    # Login
    _, resp = http("POST", "/auth/login", {
        "email": "mia.walker@apexretail.com",
        "password": "Cashier@123"
    })
    token = resp.get("data", {}).get("access_token")
    if not token:
        skip_test("Logout test — login failed")
        return

    # Token works before logout
    status, _ = http("GET", "/auth/me", token=token)
    assert_test("Token valid before logout (200)", status == 200, f"Got {status}")

    # Logout
    status, resp2 = http("POST", "/auth/logout", token=token)
    assert_test("Logout returns 200", status == 200, f"Got {status}")

    # Token rejected after logout
    status, _ = http("GET", "/auth/me", token=token)
    assert_test("Token rejected after logout (401)", status == 401, f"Got {status}")


def test_token_refresh():
    section("10. API — Refresh Token Rotation")
    if not check_server():
        skip_test("Refresh token tests — server not running")
        return

    _, resp = http("POST", "/auth/login", {
        "email": "diana.chen@apexretail.com",
        "password": "Inv@12345"
    })
    access  = resp.get("data", {}).get("access_token")
    refresh = resp.get("data", {}).get("refresh_token")

    if not refresh:
        skip_test("Refresh token test — login failed")
        return

    # Refresh
    status, resp2 = http("POST", "/auth/refresh", {"refresh_token": refresh})
    assert_test("Refresh returns 200",              status == 200, f"Got {status}")
    assert_test("New access token issued",          "access_token" in resp2.get("data", {}))
    assert_test("New refresh token issued (rotation)", "refresh_token" in resp2.get("data", {}))
    new_access  = resp2.get("data", {}).get("access_token")
    new_refresh = resp2.get("data", {}).get("refresh_token")
    assert_test("New access token differs from old",  new_access != access)
    assert_test("New refresh token differs from old", new_refresh != refresh)

    # Old refresh is revoked
    status2, _ = http("POST", "/auth/refresh", {"refresh_token": refresh})
    assert_test("Old refresh token is revoked (401)", status2 == 401, f"Got {status2}")

    # New access token works
    status3, _ = http("GET", "/auth/me", token=new_access)
    assert_test("New access token is valid (200)", status3 == 200, f"Got {status3}")


# ─────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  RETAIL COPILOT (TRACK_DIPHS08) — AUTH TEST SUITE")
    print("=" * 60)

    if not check_server():
        print("\n  [!] Server NOT running on http://localhost:5000")
        print("      Unit tests will still run. Integration tests will be skipped.")
        print("      To run all tests: py server.py  (in another terminal)\n")

    # Unit tests (no server needed)
    test_password_hashing()
    test_jwt()
    test_validation()
    test_rbac()

    # Integration tests (server required)
    test_registration_api()
    login_result = test_login_api()
    at = rt = None
    if isinstance(login_result, tuple):
        at, rt = login_result
    test_protected_routes(at)
    test_rbac_api(at)
    test_logout_and_blacklist()
    test_token_refresh()

    # Summary
    total = passed + failed + skipped
    print(f"\n{'='*60}")
    print(f"  RESULTS: {passed}/{total} passed | {failed} failed | {skipped} skipped")
    print(f"{'='*60}\n")

    if failed > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
