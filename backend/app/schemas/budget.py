from pydantic import BaseModel, Field
from typing import Optional

class BudgetBase(BaseModel):
    category: str = Field(..., description="The category this budget applies to (e.g., 'Food')")
    limit_amount: float = Field(..., gt=0, description="The maximum spending allowed for this category")
    month: str = Field(..., description="The month this budget applies to in YYYY-MM format (e.g., '2026-09')")

class BudgetCreate(BudgetBase):
    pass

class BudgetUpdate(BaseModel):
    limit_amount: float = Field(..., gt=0, description="The new maximum spending allowed")

class BudgetResponse(BudgetBase):
    id: int
    user_id: int
    created_at: str

    class Config:
        from_attributes = True
