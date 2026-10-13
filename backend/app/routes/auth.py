from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.schemas.user import UserRegister, UserLogin, UserProfileUpdate, PasswordChange, UserResponse, TokenResponse
from app.services import auth_service

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=201)
def register(user: UserRegister):
    """Create a new user account."""
    return auth_service.register_user(user)

@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Authenticate user and return a JWT token.
    FastAPI's OAuth2PasswordRequestForm expects 'username' and 'password'
    in standard form-data (not JSON). We map 'username' to our 'email'.
    """
    login_data = UserLogin(email=form_data.username, password=form_data.password)
    return auth_service.login_user(login_data)

@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(auth_service.get_current_user)):
    """
    Get the currently logged-in user's profile.
    This is a PROTECTED route requiring a valid JWT token.
    """
    fresh_user = auth_service.user_db.get_user_by_id(current_user['id'])
    return fresh_user or current_user

@router.put("/me", response_model=UserResponse)
@router.put("/profile", response_model=UserResponse)
def update_profile(profile_data: UserProfileUpdate, current_user: dict = Depends(auth_service.get_current_user)):
    """Update user's name and/or email address."""
    return auth_service.update_user_profile(current_user['id'], profile_data)

@router.post("/change-password")
def change_password(data: PasswordChange, current_user: dict = Depends(auth_service.get_current_user)):
    """Change the user's password securely."""
    return auth_service.change_password(current_user['id'], data)

@router.delete("/me")
def delete_account(current_user: dict = Depends(auth_service.get_current_user)):
    """Permanently delete user account and all associated financial records."""
    return auth_service.delete_account(current_user['id'])
