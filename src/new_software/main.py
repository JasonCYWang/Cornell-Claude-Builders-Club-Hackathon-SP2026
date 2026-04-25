"""CLI entrypoint for the new software project."""

from __future__ import annotations

import argparse

from new_software.core import create_product_message


def build_parser() -> argparse.ArgumentParser:
    """Build and return the CLI parser."""
    parser = argparse.ArgumentParser(
        prog="new-software",
        description="Create a starter message for a new software product.",
    )
    parser.add_argument(
        "name",
        nargs="?",
        default="My Product",
        help="Name of the software product to generate.",
    )
    return parser


def main() -> None:
    """Run the command-line interface."""
    parser = build_parser()
    args = parser.parse_args()
    print(create_product_message(args.name))


if __name__ == "__main__":
    main()
