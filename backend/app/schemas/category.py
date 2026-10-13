from pydantic import BaseModel, Field, ConfigDict
from typing import Optional

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50, description="Category name (e.g., 'Rent', 'Gym', 'Pets')")
    color: str = Field("#8B5CF6", max_length=20, description="Hex color code (e.g., '#8B5CF6')")
    icon: Optional[str] = Field("Tag", max_length=50, description="Icon name (e.g., 'Home', 'Tag', 'ShoppingBag')")

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    user_id: Optional[int] = None
    is_default: bool = False
    created_at: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
