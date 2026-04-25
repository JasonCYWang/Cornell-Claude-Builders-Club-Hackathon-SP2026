"""Core business logic for the project."""


def create_product_message(product_name: str) -> str:
    """Return a starter message for the generated software idea."""
    normalized_name = product_name.strip()
    if not normalized_name:
        msg = "product_name must not be empty"
        raise ValueError(msg)
    return f"Creating new software: {normalized_name}"
