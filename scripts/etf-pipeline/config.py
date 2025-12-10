"""
ETF Configuration - List of ETFs to track by provider.
"""

TRACKED_ETFS = {
    "ishares": [
        "IVV",   # S&P 500
        "IEFA",  # International Developed
        "AGG",   # US Aggregate Bond
        "IWM",   # Russell 2000
        "IWF",   # Russell 1000 Growth
        "IJH",   # S&P MidCap 400
        "IJR",   # S&P SmallCap 600
        "IEMG", # Emerging Markets
    ],
    "vanguard": [
        "VOO",   # S&P 500
        "VTI",   # Total Stock Market
        "VEA",   # Developed Markets
        "VWO",   # Emerging Markets
        "BND",   # Total Bond
        "VNQ",   # Real Estate
        "VUG",   # Growth
        "VTV",   # Value
    ],
    "ssga": [
        "SPY",   # S&P 500
        "XLF",   # Financials
        "XLK",   # Technology
        "XLE",   # Energy
        "XLV",   # Healthcare
        "GLD",   # Gold
    ],
    "invesco": [
        "QQQ",   # Nasdaq 100
        "RSP",   # Equal Weight S&P 500
        "SPLV",  # Low Volatility
    ],
}

# Output directory (relative to Next.js project root)
OUTPUT_DIR = "../../lib/data"
