from pydantic import BaseModel, Field
from typing import Optional

class GoalBase(BaseModel):
    title: str = Field(..., description="Name of the goal (e.g., 'Emergency Fund')")
    target_amount: float = Field(..., gt=0, description="The final amount you want to save")
    current_amount: float = Field(0.0, ge=0, description="How much you have saved so far")
    target_date: Optional[str] = Field(None, description="Optional target completion date (YYYY-MM-DD)")

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    target_amount: Optional[float] = Field(None, gt=0)
    current_amount: Optional[float] = Field(None, ge=0)
    target_date: Optional[str] = None

class GoalResponse(GoalBase):
    id: int
    user_id: int
    created_at: str

    class Config:
        from_attributes = True
