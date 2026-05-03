"""
core/security.py — PII Tokenizer.

Replaces personally-identifiable values (age, state) with opaque tokens
before they are sent to the Claude API.  This is a hackathon demo of the
privacy-by-design concept — in production the encryption key would come
from a KMS, not be generated at startup.

Usage:
    from core.security import tokenizer
    token = tokenizer.tokenize("AGE", "21")       # → "TKN_AGE_a3f2"
    value = tokenizer.detokenize(token)            # → "21"
"""

import uuid
from cryptography.fernet import Fernet


class PIITokenizer:
    """
    Encrypt-then-tokenize PII values.

    • tokenize()   — replaces a value with a short token, stores the
                     Fernet-encrypted original in an in-memory vault.
    • detokenize() — retrieves and decrypts the original value.
    • clear()      — wipes the entire vault (call between requests if
                     you want per-request isolation).
    """

    def __init__(self) -> None:
        # In production: load key from AWS KMS or env var.
        # For hackathon: generate once at startup, held in memory.
        self.key: bytes = Fernet.generate_key()
        self.cipher: Fernet = Fernet(self.key)
        self.vault: dict[str, bytes] = {}

    # ── public API ──────────────────────────────────────────────

    def tokenize(self, label: str, value: str) -> str:
        """Replace *value* with an opaque token and vault the encrypted original."""
        token = f"TKN_{label.upper()}_{uuid.uuid4().hex[:4]}"
        self.vault[token] = self.cipher.encrypt(value.encode())
        return token

    def detokenize(self, token: str) -> str:
        """Retrieve the original value for a given token."""
        if token not in self.vault:
            raise KeyError(f"Token not found in vault: {token}")
        return self.cipher.decrypt(self.vault[token]).decode()

    def clear(self) -> None:
        """Wipe all stored tokens (useful between independent requests)."""
        self.vault.clear()


# ── Singleton ────────────────────────────────────────────────────
# Instantiated once when the module is first imported.
tokenizer = PIITokenizer()
