import csv
import io
import re
from datetime import date
from typing import Optional, List, Dict, Any
from dateutil.parser import parse as parse_date_str

from app.database import expense_db

CATEGORY_KEYWORDS = {
    "Food": ["zomato", "swiggy", "starbucks", "mcdonald", "kfc", "burger", "pizza", "restaurant", "cafe", "dining", "food", "bistro", "bakery", "kitchen"],
    "Transport": ["uber", "ola", "rapido", "metro", "petrol", "fuel", "shell", "hpcl", "bpcl", "flight", "indigo", "irctc", "train", "bus", "parking", "toll"],
    "Entertainment": ["netflix", "spotify", "prime", "hotstar", "cinema", "pvr", "inox", "youtube", "steam", "game", "apple", "playstation"],
    "Shopping": ["amazon", "flipkart", "myntra", "zara", "h&m", "blinkit", "zepto", "instamart", "store", "mart", "supermarket", "clothing", "retail"],
    "Bills": ["electricity", "bescom", "water", "broadband", "wifi", "airtel", "jio", "vi", "bill", "recharge", "rent", "maintenance", "gas", "utility"],
    "Health": ["pharmacy", "hospital", "clinic", "apollo", "medplus", "1mg", "pharmeasy", "doctor", "lab", "dental", "medical"]
}

def infer_category(description: str, fallback: str = "Other") -> str:
    """Intelligently guesses an expense category based on transaction narration keywords."""
    if not description:
        return fallback
    desc_lower = description.lower()
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(kw in desc_lower for kw in keywords):
            return category
    return fallback

def parse_amount(val_str: Any) -> Optional[float]:
    """Cleans currency symbols, commas, and parentheses from amount string."""
    if val_str is None:
        return None
    cleaned = str(val_str).strip()
    if not cleaned:
        return None
    # Remove currency symbols (INR ₹, $, €, £) and commas
    cleaned = re.sub(r'[₹$€£\s,]', '', cleaned)
    # Handle accounting format: (120.50) -> -120.50
    if cleaned.startswith('(') and cleaned.endswith(')'):
        cleaned = '-' + cleaned[1:-1]
    try:
        amt = float(cleaned)
        return abs(amt)
    except ValueError:
        return None

def detect_column_mapping(headers: List[str]) -> Dict[str, Optional[str]]:
    """Inspects header names and suggests best matches for Date, Description, Amount, and Category."""
    mapping = {
        "date_col": None,
        "description_col": None,
        "amount_col": None,
        "category_col": None
    }
    
    headers_lower = [h.strip().lower() for h in headers]

    # Date candidates
    date_keywords = ['date', 'txn date', 'transaction date', 'posted date', 'time', 'value date']
    for kw in date_keywords:
        for idx, h in enumerate(headers_lower):
            if kw in h and not mapping["date_col"]:
                mapping["date_col"] = headers[idx]
                break

    # Description candidates
    desc_keywords = ['description', 'details', 'narration', 'particulars', 'memo', 'merchant', 'title', 'name', 'payee']
    for kw in desc_keywords:
        for idx, h in enumerate(headers_lower):
            if kw in h and not mapping["description_col"]:
                mapping["description_col"] = headers[idx]
                break

    # Amount candidates
    amt_keywords = ['amount', 'debit', 'withdrawal', 'txn amount', 'cost', 'inr', 'price', 'total']
    for kw in amt_keywords:
        for idx, h in enumerate(headers_lower):
            if kw in h and not mapping["amount_col"]:
                mapping["amount_col"] = headers[idx]
                break

    # Category candidates
    cat_keywords = ['category', 'type', 'tag', 'label']
    for kw in cat_keywords:
        for idx, h in enumerate(headers_lower):
            if kw in h and not mapping["category_col"]:
                mapping["category_col"] = headers[idx]
                break

    return mapping

def decode_csv_content(file_bytes: bytes) -> str:
    """Decodes raw file bytes, gracefully handling UTF-8 with BOM and Latin-1."""
    try:
        return file_bytes.decode('utf-8-sig')
    except UnicodeDecodeError:
        return file_bytes.decode('latin1', errors='replace')

def preview_csv(file_bytes: bytes) -> Dict[str, Any]:
    """Parses uploaded CSV file to extract headers, sample rows, and suggested mappings."""
    text = decode_csv_content(file_bytes)
    reader = csv.reader(io.StringIO(text))
    
    rows = [r for r in reader if r and any(cell.strip() for cell in r)]
    if not rows:
        raise ValueError("The uploaded CSV file is empty.")

    headers = [h.strip() for h in rows[0]]
    sample_rows = rows[1:6]
    total_data_rows = max(0, len(rows) - 1)

    suggested = detect_column_mapping(headers)

    return {
        "headers": headers,
        "suggested_mapping": suggested,
        "sample_rows": sample_rows,
        "total_rows": total_data_rows
    }

def process_csv_import(
    user_id: int,
    file_bytes: bytes,
    date_col: str,
    description_col: str,
    amount_col: str,
    category_col: Optional[str] = None,
    default_category: str = "Other",
    skip_duplicates: bool = True
) -> Dict[str, Any]:
    """Parses and imports expenses from CSV with custom column mappings and duplicate detection."""
    text = decode_csv_content(file_bytes)
    reader = csv.DictReader(io.StringIO(text))
    
    valid_expenses = []
    errors = []

    for row_idx, row in enumerate(reader, start=2): # 1-indexed, starting after header
        raw_date = row.get(date_col)
        raw_desc = row.get(description_col)
        raw_amt = row.get(amount_col)
        raw_cat = row.get(category_col) if category_col else None

        # 1. Parse Date
        if not raw_date or not raw_date.strip():
            continue
        try:
            parsed_d = parse_date_str(raw_date.strip(), dayfirst=True).date()
            date_str = str(parsed_d)
        except Exception:
            errors.append(f"Row {row_idx}: Invalid date '{raw_date}'")
            continue

        # 2. Parse Amount
        amt = parse_amount(raw_amt)
        if amt is None or amt <= 0:
            continue

        # 3. Clean Description
        desc = (raw_desc or "Imported Transaction").strip()

        # 4. Resolve Category
        cat = default_category
        if raw_cat and raw_cat.strip():
            cat = raw_cat.strip()
        else:
            inferred = infer_category(desc, fallback="")
            if inferred:
                cat = inferred

        valid_expenses.append({
            "amount": amt,
            "category": cat,
            "description": desc,
            "date": date_str
        })

    if not valid_expenses and errors:
        raise ValueError(f"Could not import any rows. First error: {errors[0]}")

    result = expense_db.bulk_create_expenses(user_id, valid_expenses, skip_duplicates=skip_duplicates)
    result["errors"] = errors[:10] # cap first 10 errors for clean UI feedback
    return result
