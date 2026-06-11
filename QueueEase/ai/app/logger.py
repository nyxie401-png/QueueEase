"""
QueueEase ML - Logging Setup
Structured logging with both console and rotating file handlers.
"""

import logging
import logging.handlers
from pathlib import Path

from .config import LOG_LEVEL, LOG_FILE


def get_logger(name: str) -> logging.Logger:
    """
    Return a named logger that writes to both stdout and a rotating file.

    Args:
        name: Module __name__ — keeps log lines traceable.

    Returns:
        Configured Logger instance.
    """
    logger = logging.getLogger(name)

    if logger.handlers:          # avoid duplicate handlers on re-import
        return logger

    logger.setLevel(getattr(logging, LOG_LEVEL.upper(), logging.INFO))

    fmt = logging.Formatter(
        fmt="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )

    # ── Console ──────────────────────────────────────────────────────────────
    ch = logging.StreamHandler()
    ch.setFormatter(fmt)
    logger.addHandler(ch)

    # ── Rotating file (10 MB × 5 backups) ────────────────────────────────────
    Path(LOG_FILE).parent.mkdir(parents=True, exist_ok=True)
    fh = logging.handlers.RotatingFileHandler(
        LOG_FILE, maxBytes=10 * 1024 * 1024, backupCount=5, encoding="utf-8"
    )
    fh.setFormatter(fmt)
    logger.addHandler(fh)

    logger.propagate = False
    return logger
