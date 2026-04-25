"""Unit tests for core logic."""

import pytest

from new_software.core import create_product_message


def test_create_product_message_returns_expected_text() -> None:
    assert create_product_message("TaskPilot") == "Creating new software: TaskPilot"


def test_create_product_message_rejects_empty_input() -> None:
    with pytest.raises(ValueError):
        create_product_message("   ")
