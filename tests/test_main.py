"""Unit tests for CLI parser behavior."""

from new_software.main import build_parser


def test_build_parser_default_name() -> None:
    parser = build_parser()
    args = parser.parse_args([])
    assert args.name == "My Product"
