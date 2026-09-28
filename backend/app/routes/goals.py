from fastapi import APIRouter, HTTPException, Depends
from typing import List

from ..schemas.goal import GoalCreate, GoalUpdate, GoalResponse
from ..database import goal_db
from ..services.auth_service import get_current_user

router = APIRouter()

@router.post("/", response_model=GoalResponse, status_code=201)
def create_goal(goal: GoalCreate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    goal_id = goal_db.create_goal(user_id, goal)
    
    created_goal = goal_db.get_goal_by_id(user_id, goal_id)
    if not created_goal:
        raise HTTPException(status_code=500, detail="Failed to retrieve created goal")
    return created_goal

@router.get("/", response_model=List[GoalResponse])
def get_goals(current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    return goal_db.get_goals(user_id)

@router.get("/{goal_id}", response_model=GoalResponse)
def get_goal(goal_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    goal = goal_db.get_goal_by_id(user_id, goal_id)
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal

@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(goal_id: int, goal: GoalUpdate, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    existing = goal_db.get_goal_by_id(user_id, goal_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Goal not found")
        
    goal_db.update_goal(user_id, goal_id, goal)
        
    return goal_db.get_goal_by_id(user_id, goal_id)

@router.delete("/{goal_id}")
def delete_goal(goal_id: int, current_user: dict = Depends(get_current_user)):
    user_id = current_user["id"]
    
    success = goal_db.delete_goal(user_id, goal_id)
    if not success:
        raise HTTPException(status_code=404, detail="Goal not found")
        
    return {"detail": "Goal deleted successfully"}
