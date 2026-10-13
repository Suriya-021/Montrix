from pydantic import BaseModel, Field, ConfigDict, field_validator
from datetime import date, datetime
from typing import List

# These are the exact 10 categories we locked in during the blueprint phase.
ALLOWED_CATEGORIES = [
    "Food", "Transport", "Entertainment", "Shopping", 
    "Bills", "Health", "Education", "Games", "Investment", "Other"
]

# ---------------------------------------------------------
# ExpenseBase: The core fields every expense has
# ---------------------------------------------------------
class ExpenseBase(BaseModel):
    # Field(...) means it's required. gt=0 means "greater than 0".
    amount: float = Field(..., gt=0, description="Expense amount in INR")
    category: str = Field(..., min_length=1, max_length=50, description="Expense category")
    description: str = Field(..., min_length=1, max_length=200)
    date: date

    # Custom validator ensuring category is not empty or whitespace
    @field_validator('category')
    @classmethod
    def check_category(cls, value: str) -> str:
        cleaned = value.strip()
        if not cleaned:
            raise ValueError("Category cannot be empty")
        return cleaned

# ---------------------------------------------------------
# ExpenseCreate: Used when the frontend sends us NEW data
# ---------------------------------------------------------
class ExpenseCreate(ExpenseBase):
    pass  # It uses everything from ExpenseBase, nothing extra needed.

# ---------------------------------------------------------
# ExpenseResponse: Used when we send data BACK to the frontend
# ---------------------------------------------------------
class ExpenseResponse(ExpenseBase):
    # The database adds these two fields, so the response must include them.
    id: int
    created_at: datetime
    
    # This tells Pydantic: "It's okay to read data from a database row object, 
    # not just a normal Python dictionary."
    model_config = ConfigDict(from_attributes=True)

class PaginatedExpensesResponse(BaseModel):
    items: List[ExpenseResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
