"""
QueueEase ML - Training Script
Run this to train (or retrain) the waiting-time model.

Usage
-----
    python train_model.py                          # train with synthetic data
    python train_model.py --data path/to/data.csv  # train with real CSV
    python train_model.py --model gradient_boosting
    python train_model.py --compare                # compare RF vs GBM
"""

from __future__ import annotations

import argparse
import sys

import pandas as pd

from .config import DATA_DIR, MODEL_DIR
from .data_generator import load_or_generate
from .logger import get_logger
from .models import QueueWaitModel

log = get_logger(__name__)


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(
        description="Train the QueueEase waiting-time model.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    p.add_argument(
        "--data",
        default=None,
        help="Path to a real CSV dataset. Uses synthetic data if not provided.",
    )
    p.add_argument(
        "--model",
        choices=["random_forest", "gradient_boosting"],
        default="random_forest",
        help="Algorithm to train.",
    )
    p.add_argument(
        "--rows",
        type=int,
        default=5_000,
        help="Number of synthetic rows to generate (ignored if --data is set).",
    )
    p.add_argument(
        "--compare",
        action="store_true",
        help="Train both RF and GBM, print comparison, save the better model.",
    )
    p.add_argument(
        "--no-save",
        action="store_true",
        help="Skip saving artefacts to disk (useful for quick experiments).",
    )
    return p.parse_args()


def train_single(
    df: pd.DataFrame,
    model_type: str,
    save: bool = True,
) -> QueueWaitModel:
    """Train one model variant and optionally save it."""
    model = QueueWaitModel(model_type=model_type)
    metrics = model.train(df)
    model.print_report()

    if not metrics.passes_quality_gates():
        log.warning(
            "⚠  Quality gates not met for %s — check data quality or tune params.",
            model_type,
        )

    if save:
        model.save()
        log.info("Artefacts written to %s/", MODEL_DIR)

    return model


def compare_models(df: pd.DataFrame, save: bool = True) -> QueueWaitModel:
    """Train RF and GBM, compare metrics, save the winner."""
    log.info("=== Model Comparison ===")

    rf  = train_single(df, "random_forest",      save=False)
    gbm = train_single(df, "gradient_boosting",  save=False)

    print("\n── Comparison ────────────────────────────────")
    print(f"  Random Forest     → {rf.metrics}")
    print(f"  Gradient Boosting → {gbm.metrics}")

    winner = rf if rf.metrics.r2 >= gbm.metrics.r2 else gbm
    print(f"  Winner            → {winner.model_type.upper()}")
    print("──────────────────────────────────────────────\n")

    if save:
        winner.save()
        log.info("Winning model (%s) saved.", winner.model_type)

    return winner


def main() -> None:
    args = parse_args()

    log.info("Loading / generating training data …")
    df = load_or_generate(csv_path=args.data, n_rows=args.rows)
    log.info("Dataset shape: %s", df.shape)

    if args.compare:
        compare_models(df, save=not args.no_save)
    else:
        train_single(df, args.model, save=not args.no_save)

    log.info("Done. ✓")


if __name__ == "__main__":
    main()
