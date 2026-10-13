from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List

class SubscriptionBase(BaseModel):
    title: str = Field(..., description="The name of the subscription (e.g., 'Netflix')")
    amount: float = Field(..., gt=0, description="The cost of the subscription")
    frequency: str = Field(..., description="How often it bills (e.g., 'Monthly', 'Yearly', 'Weekly', 'Quarterly')")
    next_due_date: str = Field(..., description="The next billing date in YYYY-MM-DD format")

class SubscriptionCreate(SubscriptionBase):
    pass

class SubscriptionUpdate(BaseModel):
    title: Optional[str] = None
    amount: Optional[float] = Field(None, gt=0)
    frequency: Optional[str] = None
    next_due_date: Optional[str] = None

class SubscriptionResponse(SubscriptionBase):
    id: int
    user_id: int
    created_at: str

    model_config = ConfigDict(from_attributes=True)

class PaySubscriptionResponse(BaseModel):
    message: str
    expense_id: int
    new_due_date: str
    subscription: SubscriptionResponse

class ProcessDueResponse(BaseModel):
    processed_count: int
    total_amount: float
    logged_subscriptions: List[SubscriptionResponse]
