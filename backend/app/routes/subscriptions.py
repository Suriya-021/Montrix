from fastapi import APIRouter, HTTPException, Depends
from typing import List

from ..schemas.subscription import SubscriptionCreate, SubscriptionUpdate, SubscriptionResponse
from ..database import subscription_db
from ..services.auth_service import get_current_user

router = APIRouter()

@router.post("/", response_model=SubscriptionResponse, status_code=201)
def create_subscription(sub: SubscriptionCreate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    sub_id = subscription_db.create_subscription(user_id, sub)
    
    # Return the created subscription
    created_sub = subscription_db.get_subscription_by_id(user_id, sub_id)
    if not created_sub:
        raise HTTPException(status_code=500, detail="Failed to retrieve created subscription")
    return created_sub

@router.get("/", response_model=List[SubscriptionResponse])
def get_subscriptions(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    return subscription_db.get_subscriptions(user_id)

@router.get("/{sub_id}", response_model=SubscriptionResponse)
def get_subscription(sub_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    sub = subscription_db.get_subscription_by_id(user_id, sub_id)
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    return sub

@router.put("/{sub_id}", response_model=SubscriptionResponse)
def update_subscription(sub_id: int, sub: SubscriptionUpdate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    # Check if subscription exists first
    existing = subscription_db.get_subscription_by_id(user_id, sub_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Subscription not found")
        
    subscription_db.update_subscription(user_id, sub_id, sub)
        
    return subscription_db.get_subscription_by_id(user_id, sub_id)

@router.delete("/{sub_id}")
def delete_subscription(sub_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    success = subscription_db.delete_subscription(user_id, sub_id)
    if not success:
        raise HTTPException(status_code=404, detail="Subscription not found")
        
    return {"detail": "Subscription deleted successfully"}
