"""
auth/auth_core.py
Retail Copilot (TRACK_DIPHS08) — Authentication Core
Password hashing: PBKDF2-HMAC-SHA256 (stdlib, secure, bcrypt-equivalent)
JWT: HS256 implementation using hmac + hashlib + base64 (stdlib only)
"""

import hashlib
import hmac
import base64
import json
import os
import time
import secrets
import re
from typing import Optional, Dict, Any

# ─────────────────────────────────────────────────────────────
# ROLE DEFINITIONS & PERMISSION MAP
# ─────────────────────────────────────────────────────────────

ROLES = {
    "SUPER_ADMIN": {
        "label": "Super Administrator",
        "permissions": [
            "users:*", "roles:*", "stores:*",
            "products:*", "categories:*", "suppliers:*",
            "inventory:*", "sales:*", "purchases:*",
            "payments:*", "analytics:*", "alerts:*",
            "copilot:*", "audit:*"
        ]
    },
    "STORE_MANAGER": {
        "label": "Store Manager",
        "permissions": [
            "products:read", "products:create", "products:update",
            "categories:read", "suppliers:read", "suppliers:create",
            "inventory:read", "inventory:adjust", "inventory:transfer",
            "sales:read", "sales:create", "sales:void",
            "purchases:read", "purchases:create", "purchases:approve",
            "payments:read", "analytics:read", "alerts:read",
            "alerts:acknowledge", "copilot:use", "audit:read"
        ]
    },
    "INVENTORY_SPECIALIST": {
        "label": "Inventory Specialist",
        "permissions": [
            "products:read", "categories:read", "suppliers:read",
            "inventory:read", "inventory:adjust", "inventory:transfer",
            "purchases:read", "purchases:create",
            "alerts:read", "alerts:acknowledge"
        ]
    },
    "CASHIER": {
        "label": "Cashier / Sales Rep",
        "permissions": [
            "products:read", "categories:read",
            "inventory:read",
            "sales:read", "sales:create",
            "payments:create", "payments:read"
        ]
    },
    "AUDITOR": {
        "label": "Executive / Auditor",
        "permissions": [
            "products:read", "categories:read",
            "inventory:read", "sales:read",
            "purchases:read", "payments:read",
            "analytics:read", "alerts:read", "audit:read"
        ]
    }
}

# ─────────────────────────────────────────────────────────────
# CONSTANTS
# ─────────────────────────────────────────────────────────────

PBKDF2_ITERATIONS  = 260_000      # OWASP 2024 recommended minimum
PBKDF2_HASH        = "sha256"
SALT_BYTES         = 32
ACCESS_TOKEN_TTL   = 3600          # 1 hour
REFRESH_TOKEN_TTL  = 7 * 86400     # 7 days


# ─────────────────────────────────────────────────────────────
# PASSWORD HASHING  (PBKDF2-HMAC-SHA256)
# ─────────────────────────────────────────────────────────────

def hash_password(plaintext: str) -> str:
    """
    Hash a plaintext password with PBKDF2-HMAC-SHA256.
    Returns a single storable string:
      pbkdf2$sha256$<iterations>$<hex-salt>$<hex-digest>
    """
    salt   = os.urandom(SALT_BYTES)
    digest = hashlib.pbkdf2_hmac(
        PBKDF2_HASH,
        plaintext.encode("utf-8"),
        salt,
        PBKDF2_ITERATIONS
    )
    return (
        f"pbkdf2${PBKDF2_HASH}${PBKDF2_ITERATIONS}"
        f"${salt.hex()}${digest.hex()}"
    )


def verify_password(plaintext: str, stored_hash: str) -> bool:
    """
    Verify a plaintext password against a stored PBKDF2 hash.
    Uses hmac.compare_digest to prevent timing attacks.
    """
    try:
        _, algo, iterations_str, salt_hex, digest_hex = stored_hash.split("$")
        iterations = int(iterations_str)
        salt       = bytes.fromhex(salt_hex)
        expected   = bytes.fromhex(digest_hex)
        computed   = hashlib.pbkdf2_hmac(
            algo,
            plaintext.encode("utf-8"),
            salt,
            iterations
        )
        return hmac.compare_digest(computed, expected)
    except Exception:
        return False


# ─────────────────────────────────────────────────────────────
# JWT  (HS256, stdlib only)
# ─────────────────────────────────────────────────────────────

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(s: str) -> bytes:
    padding = 4 - len(s) % 4
    return base64.urlsafe_b64decode(s + "=" * padding)


def _jwt_sign(header_b64: str, payload_b64: str, secret: str) -> str:
    msg = f"{header_b64}.{payload_b64}".encode("utf-8")
    sig = hmac.new(secret.encode("utf-8"), msg, hashlib.sha256).digest()
    return _b64url_encode(sig)


def create_access_token(payload: Dict[str, Any], secret: str) -> str:
    header  = {"alg": "HS256", "typ": "JWT"}
    now     = int(time.time())
    payload = {
        **payload,
        "iat": now,
        "exp": now + ACCESS_TOKEN_TTL,
        "type": "access"
    }
    h = _b64url_encode(json.dumps(header, separators=(",", ":")).encode())
    p = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode())
    s = _jwt_sign(h, p, secret)
    return f"{h}.{p}.{s}"


def create_refresh_token(payload: Dict[str, Any], secret: str) -> str:
    header  = {"alg": "HS256", "typ": "JWT"}
    now     = int(time.time())
    payload = {
        **payload,
        "iat": now,
        "exp": now + REFRESH_TOKEN_TTL,
        "type": "refresh",
        "jti": secrets.token_hex(16)   # unique token ID for revocation
    }
    h = _b64url_encode(json.dumps(header, separators=(",", ":")).encode())
    p = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode())
    s = _jwt_sign(h, p, secret)
    return f"{h}.{p}.{s}"


def verify_token(token: str, secret: str, expected_type: str = "access") -> Optional[Dict[str, Any]]:
    """
    Verify a JWT token. Returns the decoded payload dict or None on failure.
    """
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        h, p, s = parts
        # Verify signature
        expected_sig = _jwt_sign(h, p, secret)
        if not hmac.compare_digest(expected_sig, s):
            return None
        # Decode payload
        payload = json.loads(_b64url_decode(p))
        # Check expiry
        if payload.get("exp", 0) < int(time.time()):
            return None
        # Check token type
        if payload.get("type") != expected_type:
            return None
        return payload
    except Exception:
        return None


# ─────────────────────────────────────────────────────────────
# INPUT VALIDATION
# ─────────────────────────────────────────────────────────────

EMAIL_RE    = re.compile(r'^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$')
PASSWORD_RE = re.compile(r'^(?=.*[A-Za-z])(?=.*\d).{8,}$')

class ValidationError(Exception):
    pass

def validate_registration(data: dict) -> dict:
    errors = {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    full_name = (data.get("full_name") or data.get("fullName") or "").strip()
    role = (data.get("role") or "CASHIER").upper()

    if not email:
        errors["email"] = "Email is required"
    elif not EMAIL_RE.match(email):
        errors["email"] = "Invalid email format"

    if not password:
        errors["password"] = "Password is required"
    elif len(password) < 8:
        errors["password"] = "Password must be at least 8 characters"
    elif not PASSWORD_RE.match(password):
        errors["password"] = "Password must contain at least one letter and one number"

    if not full_name:
        errors["full_name"] = "Full name is required"
    elif len(full_name) < 2:
        errors["full_name"] = "Full name must be at least 2 characters"

    if role not in ROLES:
        errors["role"] = f"Invalid role. Must be one of: {', '.join(ROLES.keys())}"

    if errors:
        raise ValidationError(errors)

    return {"email": email, "password": password, "full_name": full_name, "role": role}


def validate_login(data: dict) -> dict:
    errors = {}
    email    = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email:
        errors["email"] = "Email is required"
    if not password:
        errors["password"] = "Password is required"

    if errors:
        raise ValidationError(errors)

    return {"email": email, "password": password}


def has_permission(role: str, required_permission: str) -> bool:
    """
    Check if a role has a specific permission.
    Supports wildcard '*' in both role permissions and required_permission resource.
    E.g. 'products:*' grants 'products:read', 'products:create', etc.
    """
    perms = ROLES.get(role, {}).get("permissions", [])
    if "*" in perms:
        return True
    resource, action = (required_permission.split(":", 1) + ["*"])[:2]
    for p in perms:
        pr, pa = (p.split(":", 1) + ["*"])[:2]
        if (pr == resource or pr == "*") and (pa == action or pa == "*"):
            return True
    return False
