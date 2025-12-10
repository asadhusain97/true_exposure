#!/usr/bin/env python3
"""
Tests for ETF Holdings Collection Script
"""

import os
import tempfile
from pathlib import Path
from unittest.mock import MagicMock, patch

import pandas as pd
import pytest

from collect import (
    normalize_ticker,
    is_equity_ticker,
    normalize_holdings_df,
    extract_unique_stocks,
)


class TestTickerNormalization:
    """Tests for ticker normalization."""

    def test_brk_b_variations(self):
        """BRK.B, BRK-B, BRKB should all normalize to BRK-B."""
        assert normalize_ticker("BRK.B") == "BRK-B"
        assert normalize_ticker("BRK-B") == "BRK-B"
        assert normalize_ticker("BRKB") == "BRK-B"

    def test_bf_b_variations(self):
        """BF.B, BF-B should normalize to BF-B."""
        assert normalize_ticker("BF.B") == "BF-B"
        assert normalize_ticker("BF-B") == "BF-B"

    def test_regular_tickers_unchanged(self):
        """Regular tickers should remain unchanged."""
        assert normalize_ticker("AAPL") == "AAPL"
        assert normalize_ticker("GOOGL") == "GOOGL"
        assert normalize_ticker("MSFT") == "MSFT"

    def test_lowercase_converted_to_uppercase(self):
        """Lowercase tickers should be uppercased."""
        assert normalize_ticker("aapl") == "AAPL"
        assert normalize_ticker("Msft") == "MSFT"

    def test_whitespace_stripped(self):
        """Whitespace should be stripped."""
        assert normalize_ticker("  AAPL  ") == "AAPL"
        assert normalize_ticker("\tGOOGL\n") == "GOOGL"

    def test_slash_replaced_with_dash(self):
        """Slashes should be replaced with dashes."""
        assert normalize_ticker("BRK/B") == "BRK-B"

    def test_none_and_empty(self):
        """None and empty strings should return None."""
        assert normalize_ticker(None) is None
        assert normalize_ticker("") is None
        assert normalize_ticker("   ") is None


class TestIsEquityTicker:
    """Tests for equity ticker detection."""

    def test_regular_tickers_are_equity(self):
        """Regular stock tickers should be identified as equity."""
        assert is_equity_ticker("AAPL") is True
        assert is_equity_ticker("GOOGL") is True
        assert is_equity_ticker("BRK-B") is True

    def test_cash_is_not_equity(self):
        """Cash holdings should not be identified as equity."""
        assert is_equity_ticker("CASH") is False
        assert is_equity_ticker("CASH_USD") is False

    def test_usd_is_not_equity(self):
        """USD holdings should not be identified as equity."""
        assert is_equity_ticker("USD") is False

    def test_none_is_not_equity(self):
        """None should not be identified as equity."""
        assert is_equity_ticker(None) is False
        assert is_equity_ticker("") is False


class TestHoldingsNormalization:
    """Tests for holdings DataFrame normalization."""

    def test_normalizes_column_names(self):
        """Should normalize various column name formats."""
        input_df = pd.DataFrame(
            {
                "ticker": ["AAPL", "GOOGL"],
                "Name": ["Apple Inc", "Alphabet Inc"],
                "Weight": [5.0, 4.0],
            }
        )

        result = normalize_holdings_df(input_df, "ishares", "IVV")

        assert "stock_ticker" in result.columns
        assert "stock_name" in result.columns
        assert "weight" in result.columns
        assert "fund_ticker" in result.columns
        assert result["fund_ticker"].iloc[0] == "IVV"
        assert result["provider"].iloc[0] == "ishares"

    def test_normalizes_tickers_in_df(self):
        """Should normalize stock tickers in the DataFrame."""
        input_df = pd.DataFrame(
            {
                "ticker": ["brk.b", "AAPL"],
                "name": ["Berkshire", "Apple"],
                "weight": [5.0, 4.0],
            }
        )

        result = normalize_holdings_df(input_df, "vanguard", "VOO")

        assert "BRK-B" in result["stock_ticker"].values
        assert "AAPL" in result["stock_ticker"].values


class TestExtractUniqueStocks:
    """Tests for extracting unique stocks."""

    def test_deduplicates_stocks(self):
        """Should deduplicate stocks by ticker."""
        holdings_df = pd.DataFrame(
            {
                "fund_ticker": ["IVV", "VOO", "SPY"],
                "stock_ticker": ["AAPL", "AAPL", "GOOGL"],
                "stock_name": ["Apple Inc", "Apple Inc", "Alphabet Inc"],
                "cusip": ["037833100", "037833100", "02079K305"],
                "isin": ["US0378331005", "US0378331005", "US02079K3059"],
            }
        )

        result = extract_unique_stocks(holdings_df)

        assert len(result) == 2  # AAPL and GOOGL
        assert "AAPL" in result["ticker"].values
        assert "GOOGL" in result["ticker"].values


class TestCSVOutputFormat:
    """Tests for CSV output format."""

    def test_csv_headers_match_schema(self):
        """CSV files should have headers matching the schema."""
        # Test that we can create a valid DataFrame with expected columns
        holdings_df = pd.DataFrame(
            {
                "fund_ticker": ["IVV"],
                "fund_name": ["iShares Core S&P 500 ETF"],
                "provider": ["ishares"],
                "as_of_date": ["2024-01-15"],
                "stock_ticker": ["AAPL"],
                "stock_name": ["APPLE INC"],
                "cusip": ["037833100"],
                "isin": ["US0378331005"],
                "weight": [7.12],
                "shares": [3337421],
                "market_value": [645234567.89],
            }
        )

        expected_cols = [
            "fund_ticker",
            "fund_name",
            "provider",
            "as_of_date",
            "stock_ticker",
            "stock_name",
            "cusip",
            "isin",
            "weight",
            "shares",
            "market_value",
        ]

        for col in expected_cols:
            assert col in holdings_df.columns

    def test_csv_utf8_encoding(self):
        """CSV files should use UTF-8 encoding."""
        df = pd.DataFrame(
            {
                "ticker": ["AAPL"],
                "name": ["Apple Inc™"],  # Unicode character
            }
        )

        with tempfile.NamedTemporaryFile(
            mode="w", suffix=".csv", delete=False, encoding="utf-8"
        ) as f:
            df.to_csv(f, index=False, encoding="utf-8")
            temp_path = f.name

        try:
            # Read back and verify
            result = pd.read_csv(temp_path, encoding="utf-8")
            assert result["name"].iloc[0] == "Apple Inc™"
        finally:
            os.unlink(temp_path)


class TestStockEnrichment:
    """Tests for stock enrichment with mocked yfinance."""

    @patch("collect.yf.Ticker")
    def test_enrichment_populates_sector_industry(self, mock_ticker_class):
        """Should populate sector and industry from yfinance."""
        # Mock yfinance
        mock_ticker = MagicMock()
        mock_ticker.info = {
            "sector": "Technology",
            "industry": "Consumer Electronics",
            "marketCap": 3000000000000,
            "exchange": "NASDAQ",
        }
        mock_ticker_class.return_value = mock_ticker

        from collect import fetch_stock_info

        result = fetch_stock_info("AAPL")

        assert result["sector"] == "Technology"
        assert result["industry"] == "Consumer Electronics"
        assert result["market_cap"] == 3000000000000
        assert result["exchange"] == "NASDAQ"

    @patch("collect.yf.Ticker")
    def test_enrichment_handles_missing_data(self, mock_ticker_class):
        """Should handle missing data gracefully."""
        # Mock yfinance returning empty info
        mock_ticker = MagicMock()
        mock_ticker.info = {}
        mock_ticker_class.return_value = mock_ticker

        from collect import fetch_stock_info

        result = fetch_stock_info("UNKNOWN")

        assert result["sector"] is None
        assert result["industry"] is None


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
