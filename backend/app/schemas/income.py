from pydantic import BaseModel, Field
from typing import Optional

class IncomeBase(BaseModel):
    source: str = Field(..., description="Source of income (e.g., 'Salary', 'Freelance')")
    amount: float = Field(..., gt=0, description="Amount received")
    date: str = Field(..., description="Date the income was received (YYYY-MM-DD)")

class IncomeCreate(IncomeBase):
    pass

class IncomeUpdate(BaseModel):
    source: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    date: Optional[str] = None

class IncomeResponse(IncomeBase):
    id: int
    user_id: int
    created_at: str

    class Config:
        from_attributes = True
