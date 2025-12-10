# ETF Holdings Data Pipeline

A Python script that fetches ETF holdings from major providers (iShares, Vanguard, SPDR, Invesco) and outputs CSV files for the Next.js portfolio analyzer.

## Setup

```bash
cd scripts/etf-pipeline
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## Usage

### Run Collection

```bash
source venv/bin/activate
python collect.py
```

This will:
1. Fetch holdings from 25+ ETFs across 4 providers
2. Enrich stocks with sector/industry data from Yahoo Finance
3. Output 3 CSV files to `lib/data/`

**Expected runtime:** ~10 minutes (due to rate limiting)

### Output Files

| File | Description | Rows |
|------|-------------|------|
| `holdings.csv` | ETF holdings (fund-stock pairs) | ~50K |
| `stocks.csv` | Unique stocks with sector/industry | ~5K |
| `funds.csv` | ETF metadata | ~25 |

## Run Tests

```bash
source venv/bin/activate
pip install pytest
pytest test_collect.py -v
```

## Configuration

Edit `config.py` to add/remove ETFs:

```python
TRACKED_ETFS = {
    "ishares": ["IVV", "IEFA", ...],
    "vanguard": ["VOO", "VTI", ...],
    "ssga": ["SPY", "XLF", ...],
    "invesco": ["QQQ", "RSP", ...],
}
```

## Scheduling (Optional)

For daily updates, add a cron job:

```bash
# Run daily at 6 AM
0 6 * * * cd /path/to/project/scripts/etf-pipeline && ./venv/bin/python collect.py
```

## Troubleshooting

- **Rate limiting**: The script adds delays between requests. If you get errors, try increasing delays in `collect.py`.
- **Missing stocks**: Some tickers won't have Yahoo Finance data (foreign stocks, delisted). They'll have null sector/industry.
- **No holdings**: Some ETFs (like GLD) hold commodities, not stocks, so they'll show 0 equity holdings.
