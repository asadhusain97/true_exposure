#!/usr/bin/env python3
"""
ETF Holdings Collection Script

Fetches ETF holdings from major providers (iShares, Vanguard, SPDR, Invesco),
enriches stocks with sector/industry data, and outputs CSV files.
"""

import os
import re
import time
from datetime import datetime
from pathlib import Path

import pandas as pd
import yfinance as yf
from etf_scraper import ETFScraper
from tenacity import retry, stop_after_attempt, wait_exponential
from tqdm import tqdm

from config import TRACKED_ETFS, OUTPUT_DIR

# Initialize ETF scraper
etf_scraper = ETFScraper()


# ============================================================================
# Ticker Normalization
# ============================================================================


def normalize_ticker(ticker: str | None) -> str | None:
    """
    Normalize ticker symbols to a consistent format.

    Examples:
        BRK.B, BRK-B, BRKB → BRK-B
        BF.B, BF-B → BF-B
        Tickers with '/' → replace with '-'
    """
    if not ticker or not isinstance(ticker, str):
        return None

    # Clean up whitespace and uppercase
    ticker = ticker.strip().upper()

    if not ticker:
        return None

    # Handle common variations
    # Replace . and / with -
    ticker = re.sub(r"[./]", "-", ticker)

    # Handle cases like BRKB → BRK-B (only for known patterns)
    known_patterns = {
        "BRKB": "BRK-B",
        "BFB": "BF-B",
    }
    if ticker in known_patterns:
        ticker = known_patterns[ticker]

    return ticker


def is_equity_ticker(ticker: str | None) -> bool:
    """Check if a ticker represents an equity (not bonds, cash, futures, etc.)."""
    if not ticker:
        return False

    # Skip common non-equity patterns
    skip_patterns = [
        r"^CASH",
        r"^USD",
        r"^MARGIN",
        r"^\$",
        r"^FUT_",
        r"^\.",
    ]

    for pattern in skip_patterns:
        if re.match(pattern, ticker.upper()):
            return False

    return True


# ============================================================================
# Holdings Fetching
# ============================================================================


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def fetch_single_etf(ticker: str) -> pd.DataFrame | None:
    """Fetch holdings for a single ETF with retry logic."""
    try:
        holdings = etf_scraper.query_holdings(ticker)
        if holdings is None or (hasattr(holdings, "empty") and holdings.empty):
            return None
        return holdings
    except Exception as e:
        print(f"    Error fetching {ticker}: {e}")
        raise


def fetch_all_holdings() -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Fetch holdings from all tracked ETFs.

    Returns:
        tuple: (holdings_df, funds_df)
    """
    all_holdings = []
    funds_data = []

    total_etfs = sum(len(etfs) for etfs in TRACKED_ETFS.values())
    print(
        f"\nFetching holdings from {len(TRACKED_ETFS)} providers, {total_etfs} ETFs...\n"
    )

    for provider, etf_list in TRACKED_ETFS.items():
        for ticker in etf_list:
            try:
                print(f"[{provider}] {ticker}: ", end="", flush=True)

                holdings = fetch_single_etf(ticker)

                if holdings is None or len(holdings) == 0:
                    print("No holdings found")
                    continue

                # Normalize the DataFrame columns
                holdings = normalize_holdings_df(holdings, provider, ticker)

                print(f"{len(holdings)} holdings ✓")

                # Record fund metadata
                funds_data.append(
                    {
                        "ticker": ticker,
                        "name": holdings["fund_name"].iloc[0]
                        if "fund_name" in holdings.columns
                        else ticker,
                        "provider": provider,
                        "total_holdings": len(holdings),
                        "as_of_date": holdings["as_of_date"].iloc[0]
                        if "as_of_date" in holdings.columns
                        else datetime.now().strftime("%Y-%m-%d"),
                        "collected_at": datetime.now().isoformat(),
                    }
                )

                all_holdings.append(holdings)

                # Rate limiting
                time.sleep(1.5)

            except Exception as e:
                print(f"Error: {e}")
                continue

    if not all_holdings:
        return pd.DataFrame(), pd.DataFrame()

    holdings_df = pd.concat(all_holdings, ignore_index=True)
    funds_df = pd.DataFrame(funds_data)

    return holdings_df, funds_df


def normalize_holdings_df(
    df: pd.DataFrame, provider: str, fund_ticker: str
) -> pd.DataFrame:
    """Normalize holdings DataFrame to consistent schema."""

    # Create a standardized DataFrame
    normalized = pd.DataFrame()

    # Map various column names to our schema
    column_mappings = {
        "fund_ticker": ["fund_ticker", "etf_ticker", "ticker"],
        "fund_name": ["fund_name", "etf_name", "name"],
        "stock_ticker": ["stock_ticker", "ticker", "symbol", "Ticker"],
        "stock_name": ["stock_name", "name", "Name", "security_name", "Security Name"],
        "cusip": ["cusip", "CUSIP"],
        "isin": ["isin", "ISIN"],
        "weight": ["weight", "Weight", "pct_weight", "% Weight", "weight_pct"],
        "shares": ["shares", "Shares", "share_count", "Shares Held"],
        "market_value": ["market_value", "Market Value", "value", "Value"],
    }

    for target_col, source_cols in column_mappings.items():
        for source_col in source_cols:
            if source_col in df.columns:
                normalized[target_col] = df[source_col]
                break
        if target_col not in normalized.columns:
            normalized[target_col] = None

    # Fill in fund info
    normalized["fund_ticker"] = fund_ticker
    normalized["provider"] = provider

    # Try to extract fund name from the DataFrame or use ticker
    if "fund_name" not in normalized.columns or normalized["fund_name"].isna().all():
        normalized["fund_name"] = fund_ticker

    # Add as_of_date if not present
    if "as_of_date" not in normalized.columns:
        # Try to find date column
        date_cols = ["as_of_date", "date", "Date", "as_of"]
        for col in date_cols:
            if col in df.columns:
                normalized["as_of_date"] = df[col]
                break
        if "as_of_date" not in normalized.columns:
            normalized["as_of_date"] = datetime.now().strftime("%Y-%m-%d")

    # Normalize stock tickers
    normalized["stock_ticker"] = normalized["stock_ticker"].apply(normalize_ticker)

    # Convert weight to float (handle percentages)
    if "weight" in normalized.columns:
        normalized["weight"] = pd.to_numeric(normalized["weight"], errors="coerce")
        # If weights are > 1, assume they're percentages
        if normalized["weight"].max() > 1:
            # Keep as percentage for readability
            pass

    # Filter to only equity holdings
    normalized = normalized[normalized["stock_ticker"].apply(is_equity_ticker)]

    return normalized


# ============================================================================
# Stock Enrichment
# ============================================================================


def extract_unique_stocks(holdings_df: pd.DataFrame) -> pd.DataFrame:
    """Extract unique stocks from holdings DataFrame."""

    # Get unique stock tickers
    stocks = (
        holdings_df.groupby("stock_ticker")
        .agg(
            {
                "stock_name": "first",
                "cusip": "first",
                "isin": "first",
            }
        )
        .reset_index()
    )

    stocks.columns = ["ticker", "name", "cusip", "isin"]

    # Remove any None/null tickers
    stocks = stocks[stocks["ticker"].notna() & (stocks["ticker"] != "")]

    return stocks


@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=2, max=10))
def fetch_stock_info(ticker: str) -> dict:
    """Fetch stock info from Yahoo Finance."""
    try:
        stock = yf.Ticker(ticker)
        info = stock.info
        return {
            "sector": info.get("sector"),
            "industry": info.get("industry"),
            "market_cap": info.get("marketCap"),
            "exchange": info.get("exchange"),
        }
    except Exception:
        return {
            "sector": None,
            "industry": None,
            "market_cap": None,
            "exchange": None,
        }


def enrich_stocks(stocks_df: pd.DataFrame) -> pd.DataFrame:
    """Enrich stocks with sector/industry data from Yahoo Finance."""

    print(f"\nEnriching stock data from Yahoo Finance...")

    enriched_data = []
    failed_count = 0

    for _, row in tqdm(stocks_df.iterrows(), total=len(stocks_df), desc="Enriching"):
        ticker = row["ticker"]

        try:
            info = fetch_stock_info(ticker)

            enriched_data.append(
                {
                    "ticker": ticker,
                    "name": row["name"],
                    "cusip": row["cusip"],
                    "isin": row["isin"],
                    "sector": info["sector"],
                    "industry": info["industry"],
                    "market_cap": info["market_cap"],
                    "exchange": info["exchange"],
                }
            )

            # Small delay to avoid rate limiting
            time.sleep(0.1)

        except Exception as e:
            failed_count += 1
            enriched_data.append(
                {
                    "ticker": ticker,
                    "name": row["name"],
                    "cusip": row["cusip"],
                    "isin": row["isin"],
                    "sector": None,
                    "industry": None,
                    "market_cap": None,
                    "exchange": None,
                }
            )

    success_count = len(stocks_df) - failed_count
    print(
        f"\nStocks enriched: {success_count}/{len(stocks_df)} ({failed_count} missing data)"
    )

    return pd.DataFrame(enriched_data)


# ============================================================================
# CSV Output
# ============================================================================


def write_csv_files(
    holdings_df: pd.DataFrame, stocks_df: pd.DataFrame, funds_df: pd.DataFrame
):
    """Write all data to CSV files."""

    # Get output directory (relative to this script)
    script_dir = Path(__file__).parent
    output_dir = script_dir / OUTPUT_DIR
    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"\nWriting CSV files to {output_dir}...")

    # Holdings CSV
    holdings_path = output_dir / "holdings.csv"
    holdings_cols = [
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
    holdings_out = holdings_df[[c for c in holdings_cols if c in holdings_df.columns]]
    holdings_out.to_csv(holdings_path, index=False, encoding="utf-8")
    print(f"✓ {holdings_path.name} ({len(holdings_out)} rows)")

    # Stocks CSV
    stocks_path = output_dir / "stocks.csv"
    stocks_cols = [
        "ticker",
        "name",
        "cusip",
        "isin",
        "sector",
        "industry",
        "market_cap",
        "exchange",
    ]
    stocks_out = stocks_df[[c for c in stocks_cols if c in stocks_df.columns]]
    stocks_out.to_csv(stocks_path, index=False, encoding="utf-8")
    print(f"✓ {stocks_path.name} ({len(stocks_out)} rows)")

    # Funds CSV
    funds_path = output_dir / "funds.csv"
    funds_cols = [
        "ticker",
        "name",
        "provider",
        "total_holdings",
        "as_of_date",
        "collected_at",
    ]
    funds_out = funds_df[[c for c in funds_cols if c in funds_df.columns]]
    funds_out.to_csv(funds_path, index=False, encoding="utf-8")
    print(f"✓ {funds_path.name} ({len(funds_out)} rows)")


# ============================================================================
# Main
# ============================================================================


def main():
    """Main entry point."""

    start_time = time.time()

    print("=" * 50)
    print("ETF Holdings Collection")
    print("=" * 50)

    # Step 1: Fetch holdings
    holdings_df, funds_df = fetch_all_holdings()

    if holdings_df.empty:
        print("\nNo holdings collected. Exiting.")
        return

    print(f"\nHoldings collected: {len(funds_df)} funds")
    print(f"Total holdings rows: {len(holdings_df)}")

    # Step 2: Extract unique stocks
    stocks_df = extract_unique_stocks(holdings_df)
    print(f"Unique stock tickers: {len(stocks_df)}")

    # Step 3: Enrich with sector/industry
    stocks_df = enrich_stocks(stocks_df)

    # Step 4: Write CSVs
    write_csv_files(holdings_df, stocks_df, funds_df)

    # Summary
    elapsed = time.time() - start_time
    minutes = int(elapsed // 60)
    seconds = int(elapsed % 60)

    print(f"\nDone! Collection completed in {minutes}m {seconds}s")


if __name__ == "__main__":
    main()
