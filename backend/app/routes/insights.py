import os
import json
from fastapi import APIRouter, Depends, HTTPException
import google.generativeai as genai
from datetime import datetime
from dotenv import load_dotenv

from app.services import expense_service
from app.services.auth_service import get_current_user

# Load environment variables
load_dotenv()

router = APIRouter(prefix="/api/insights", tags=["Insights"])

def get_gemini_model():
    load_dotenv(override=True)
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key and api_key != "your_gemini_api_key_here":
        genai.configure(api_key=api_key)
        return genai.GenerativeModel('gemini-flash-latest')
    return None

@router.get("/coach")
def get_ai_coach_insights(current_user: dict = Depends(get_current_user)):
    """
    Sends the user's current month spending data to Gemini AI and returns 3 personalized insights.
    """
    model = get_gemini_model()
    if not model:
        raise HTTPException(
            status_code=503, 
            detail="AI Coach is not configured. Please add a valid GEMINI_API_KEY to the .env file."
        )

    user_id = current_user['id']
    
    # 1. Gather Real User Data
    try:
        # Get stats which already calculates category breakdown for this month
        stats = expense_service.get_expense_stats(user_id)
        
        # If no expenses this month, AI doesn't need to run
        if stats.get('this_month_spent', 0) == 0:
            return {"insights": ["You haven't logged any expenses this month yet. Start tracking to get personalized AI insights!"]}
            
        # Format the data cleanly for the prompt
        monthly_total = stats.get('this_month_spent', 0)
        categories = stats.get('category_breakdown', [])
        
        category_text = ", ".join([f"{c['name']}: {c['value']}" for c in categories])
        
        # 2. Build the Prompt
        prompt = f"""
        You are an expert, highly analytical, and encouraging financial advisor. 
        Analyze the following real spending data for this month:
        - Total Spent: {monthly_total}
        - Spending by Category: {category_text}
        
        Based ONLY on this data, provide exactly 3 short, punchy, and actionable financial tips or insights.
        Rules:
        - Do not use markdown formatting (no asterisks, no bolding).
        - Keep each tip under 2 sentences.
        - Be specific about their categories.
        - Return the response EXACTLY as a valid JSON array of 3 strings. Example: ["Tip 1", "Tip 2", "Tip 3"]
        """
        
        # 3. Call the Real Gemini API
        response = model.generate_content(prompt)
        response_text = response.text.strip()
        
        import re
        # Find JSON array using regex just in case it added conversational text
        match = re.search(r'\[.*\]', response_text, re.DOTALL)
        if match:
            json_str = match.group(0)
            insights_array = json.loads(json_str)
        else:
            # Fallback if no array found but we got text
            insights_array = [response_text[:100] + "..."]
            
        if not isinstance(insights_array, list) or len(insights_array) == 0:
            insights_array = ["Check back later for personalized AI advice."]
            
        return {"insights": insights_array[:3]}
        
    except Exception as e:
        print(f"AI Coach Error: {str(e)}")
        # Return the actual error so the user can debug their API key issues
        error_msg = str(e)
        if "API_KEY_INVALID" in error_msg or "400" in error_msg:
            error_msg = "Your Gemini API key appears to be invalid or restricted."
            
        return {"insights": [
            f"AI Error: {error_msg}",
            "Please verify your GEMINI_API_KEY in the .env file.",
            "Keep logging your expenses in the meantime!"
        ]}
