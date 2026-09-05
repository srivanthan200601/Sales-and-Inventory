"""
auth/auth_db.py
Retail Copilot (TRACK_DIPHS08) — Auth Database Layer
Manages users, sessions, and token revocation using the existing SQLite DB.
"""

import sqlite3
import os
import uuid
import time
from typing import Optional, Dict, Any, List

DB_PATH = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "..", "database", "retail_copilot.db"
)


def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


# ─────────────────────────────────────────────────────────────
# SCHEMA BOOTSTRAP  (auth-specific tables added to main DB)
# ─────────────────────────────────────────────────────────────

def bootstrap_auth_tables():
    """Ensure auth-related tables exist alongside the main schema."""
    conn = get_connection()
    conn.executescript("""
        -- Auth users table (mirrors + extends existing users table)
        CREATE TABLE IF NOT EXISTS auth_users (
            id            TEXT PRIMARY KEY,
            email         TEXT UNIQUE NOT NULL COLLATE NOCASE,
            password_hash TEXT NOT NULL,
            full_name     TEXT NOT NULL,
            role          TEXT NOT NULL DEFAULT 'CASHIER',
            store_id      TEXT,
            is_active     INTEGER DEFAULT 1,
            is_verified   INTEGER DEFAULT 0,
            failed_attempts INTEGER DEFAULT 0,
            locked_until  TEXT,
            last_login_at TEXT,
            created_at    TEXT DEFAULT (datetime('now')),
            updated_at    TEXT DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth_users(email);

        -- Refresh token store (for logout/revocation)
        CREATE TABLE IF NOT EXISTS refresh_tokens (
            jti         TEXT PRIMARY KEY,
            user_id     TEXT NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
            expires_at  INTEGER NOT NULL,
            revoked     INTEGER DEFAULT 0,
            created_at  TEXT DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_rt_user ON refresh_tokens(user_id, revoked);

        -- Token blacklist (revoked access tokens, auto-expiring)
        CREATE TABLE IF NOT EXISTS token_blacklist (
            token_hash  TEXT PRIMARY KEY,
            expires_at  INTEGER NOT NULL,
            revoked_at  TEXT DEFAULT (datetime('now'))
        );

        -- Login audit log
        CREATE TABLE IF NOT EXISTS login_audit (
            id          TEXT PRIMARY KEY,
            user_id     TEXT,
            email       TEXT,
            event       TEXT NOT NULL,
            ip_address  TEXT,
            user_agent  TEXT,
            created_at  TEXT DEFAULT (datetime('now'))
        );
    """)
    conn.commit()
    conn.close()


# ─────────────────────────────────────────────────────────────
# USER CRUD
# ─────────────────────────────────────────────────────────────

def create_user(email: str, password_hash: str, full_name: str,
                role: str, store_id: Optional[str] = None) -> Dict[str, Any]:
    user_id = str(uuid.uuid4())
    conn = get_connection()
    try:
        conn.execute("""
            INSERT INTO auth_users
                (id, email, password_hash, full_name, role, store_id, is_active, is_verified)
            VALUES (?, ?, ?, ?, ?, ?, 1, 1)
        """, (user_id, email.lower(), password_hash, full_name, role, store_id))
        conn.commit()
        return get_user_by_id(user_id)
    finally:
        conn.close()


def get_user_by_email(email: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM auth_users WHERE email = ? AND is_active = 1",
            (email.lower(),)
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT * FROM auth_users WHERE id = ?", (user_id,)
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def email_exists(email: str) -> bool:
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT 1 FROM auth_users WHERE email = ?", (email.lower(),)
        ).fetchone()
        return row is not None
    finally:
        conn.close()


def update_last_login(user_id: str):
    conn = get_connection()
    try:
        conn.execute(
            "UPDATE auth_users SET last_login_at = datetime('now'), failed_attempts = 0 WHERE id = ?",
            (user_id,)
        )
        conn.commit()
    finally:
        conn.close()


def increment_failed_attempts(email: str) -> int:
    """Increment failed login attempts. Lock account after 5 failures for 15 minutes."""
    conn = get_connection()
    try:
        conn.execute(
            "UPDATE auth_users SET failed_attempts = failed_attempts + 1 WHERE email = ?",
            (email.lower(),)
        )
        row = conn.execute(
            "SELECT failed_attempts FROM auth_users WHERE email = ?",
            (email.lower(),)
        ).fetchone()
        attempts = row["failed_attempts"] if row else 0
        if attempts >= 5:
            locked_until = time.strftime(
                "%Y-%m-%dT%H:%M:%SZ",
                time.gmtime(time.time() + 15 * 60)
            )
            conn.execute(
                "UPDATE auth_users SET locked_until = ? WHERE email = ?",
                (locked_until, email.lower())
            )
        conn.commit()
        return attempts
    finally:
        conn.close()


def is_account_locked(user: Dict[str, Any]) -> bool:
    locked_until = user.get("locked_until")
    if not locked_until:
        return False
    try:
        import datetime
        lu = datetime.datetime.fromisoformat(locked_until.replace("Z", "+00:00"))
        now = datetime.datetime.now(datetime.timezone.utc)
        return now < lu
    except Exception:
        return False


def get_all_users() -> List[Dict[str, Any]]:
    conn = get_connection()
    try:
        rows = conn.execute("""
            SELECT id, email, full_name, role, store_id,
                   is_active, is_verified, last_login_at, created_at
            FROM auth_users ORDER BY created_at DESC
        """).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def update_user_role(user_id: str, new_role: str) -> bool:
    conn = get_connection()
    try:
        cur = conn.execute(
            "UPDATE auth_users SET role = ?, updated_at = datetime('now') WHERE id = ?",
            (new_role, user_id)
        )
        conn.commit()
        return cur.rowcount > 0
    finally:
        conn.close()


def deactivate_user(user_id: str) -> bool:
    conn = get_connection()
    try:
        cur = conn.execute(
            "UPDATE auth_users SET is_active = 0, updated_at = datetime('now') WHERE id = ?",
            (user_id,)
        )
        conn.commit()
        return cur.rowcount > 0
    finally:
        conn.close()


# ─────────────────────────────────────────────────────────────
# REFRESH TOKEN MANAGEMENT
# ─────────────────────────────────────────────────────────────

def store_refresh_token(jti: str, user_id: str, expires_at: int):
    conn = get_connection()
    try:
        conn.execute(
            "INSERT INTO refresh_tokens (jti, user_id, expires_at) VALUES (?, ?, ?)",
            (jti, user_id, expires_at)
        )
        conn.commit()
    finally:
        conn.close()


def revoke_refresh_token(jti: str):
    conn = get_connection()
    try:
        conn.execute(
            "UPDATE refresh_tokens SET revoked = 1 WHERE jti = ?", (jti,)
        )
        conn.commit()
    finally:
        conn.close()


def is_refresh_token_valid(jti: str) -> bool:
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT 1 FROM refresh_tokens WHERE jti = ? AND revoked = 0 AND expires_at > ?",
            (jti, int(time.time()))
        ).fetchone()
        return row is not None
    finally:
        conn.close()


def revoke_all_user_tokens(user_id: str):
    """Revoke all refresh tokens for a user (logout all devices)."""
    conn = get_connection()
    try:
        conn.execute(
            "UPDATE refresh_tokens SET revoked = 1 WHERE user_id = ?", (user_id,)
        )
        conn.commit()
    finally:
        conn.close()


# ─────────────────────────────────────────────────────────────
# ACCESS TOKEN BLACKLIST
# ─────────────────────────────────────────────────────────────

def blacklist_token(token: str, expires_at: int):
    """Add an access token to the blacklist (for logout)."""
    import hashlib
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    conn = get_connection()
    try:
        conn.execute(
            "INSERT OR IGNORE INTO token_blacklist (token_hash, expires_at) VALUES (?, ?)",
            (token_hash, expires_at)
        )
        conn.commit()
    finally:
        conn.close()


def is_token_blacklisted(token: str) -> bool:
    import hashlib
    token_hash = hashlib.sha256(token.encode()).hexdigest()
    conn = get_connection()
    try:
        row = conn.execute(
            "SELECT 1 FROM token_blacklist WHERE token_hash = ? AND expires_at > ?",
            (token_hash, int(time.time()))
        ).fetchone()
        return row is not None
    finally:
        conn.close()


def cleanup_expired_tokens():
    """Prune expired entries from blacklist and refresh tokens."""
    now = int(time.time())
    conn = get_connection()
    try:
        conn.execute("DELETE FROM token_blacklist WHERE expires_at <= ?", (now,))
        conn.execute("DELETE FROM refresh_tokens WHERE expires_at <= ?", (now,))
        conn.commit()
    finally:
        conn.close()


# ─────────────────────────────────────────────────────────────
# LOGIN AUDIT
# ─────────────────────────────────────────────────────────────

def log_auth_event(event: str, email: str = "", user_id: str = "",
                   ip: str = "", user_agent: str = ""):
    conn = get_connection()
    try:
        conn.execute("""
            INSERT INTO login_audit (id, user_id, email, event, ip_address, user_agent)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (str(uuid.uuid4()), user_id, email, event, ip, user_agent))
        conn.commit()
    except Exception:
        pass  # Never crash on audit log failure
    finally:
        conn.close()


# ─────────────────────────────────────────────────────────────
# SEED DEMO USERS (idempotent)
# ─────────────────────────────────────────────────────────────

def seed_demo_users():
    """Seed the 5 role-specific demo users (skips if already present)."""
    from auth.auth_core import hash_password
    
    demo_users = [
        ("admin@apexretail.com",         "Admin@1234",   "System Administrator", "SUPER_ADMIN",          None),
        ("alex.morgan@apexretail.com",   "Manager@1234", "Alex Morgan",           "STORE_MANAGER",        "s0000001-0000-0000-0000-000000000001"),
        ("diana.chen@apexretail.com",    "Inv@12345",    "Diana Chen",            "INVENTORY_SPECIALIST", "s0000001-0000-0000-0000-000000000001"),
        ("mia.walker@apexretail.com",    "Cashier@123",  "Mia Walker",            "CASHIER",              "s0000001-0000-0000-0000-000000000001"),
        ("olivia.james@apexretail.com",  "Audit@1234",   "Olivia James",          "AUDITOR",              None),
    ]

    for email, password, name, role, store_id in demo_users:
        if not email_exists(email):
            print(f"  [Auth Seed] Creating demo user: {email} ({role})")
            pw_hash = hash_password(password)
            create_user(email, pw_hash, name, role, store_id)
        else:
            print(f"  [Auth Seed] Already exists: {email}")
