from datetime import date as dt_date, datetime
from typing import Optional, Union

def parse_date(val: Optional[Union[str, dt_date]]) -> Optional[dt_date]:
    """
    Safely converts an ISO date string or date object into a python datetime.date.
    Essential for SQLite and Postgres native Date column compatibility.
    """
    if not val:
        return None
    if isinstance(val, dt_date):
        return val
    if isinstance(val, str):
        val = val.strip()
        if not val:
            return None
        val_clean = val.split('T')[0]
        return datetime.strptime(val_clean, "%Y-%m-%d").date()
    return None
