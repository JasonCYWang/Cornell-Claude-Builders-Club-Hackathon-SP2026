# Cornell-Claude-Builders-Club-Hackathon-SP2026

Team Name: The Coffees & Non-Coffees

## Python Project Scaffold

This repository now includes a standard Python project structure for building a new software product.

## Project Structure

- `src/new_software/`: main package source code
- `tests/`: unit tests with `pytest`
- `pyproject.toml`: packaging and tooling configuration
- `.gitignore`: common Python ignores

## Quick Start

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
pytest
python -m new_software.main "TaskPilot"
```

## Linting and Type Checking

```bash
ruff check .
mypy src
```
