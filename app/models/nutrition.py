from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey, Float, Date, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    settings = Column(JSON, default={})  # For custom goals

    nutrition_goals = relationship("NutritionGoal", back_populates="user", uselist=False)
    daily_logs = relationship("DailyLog", back_populates="user")
    meal_plans = relationship("MealPlan", back_populates="user")

class NutritionGoal(Base):
    __tablename__ = "nutrition_goals"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    daily_calories = Column(Integer)
    protein_g = Column(Float)
    carbs_g = Column(Float)
    fats_g = Column(Float)

    user = relationship("User", back_populates="nutrition_goals")

class DailyLog(Base):
    __tablename__ = "daily_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, default=datetime.utcnow().date())
    total_calories = Column(Integer, default=0)
    water_ml = Column(Integer, default=0)
    fasting_start = Column(DateTime)
    fasting_end = Column(DateTime)

    user = relationship("User", back_populates="daily_logs")
    food_entries = relationship("FoodEntry", back_populates="daily_log")

class FoodEntry(Base):
    __tablename__ = "food_entries"
    id = Column(Integer, primary_key=True, index=True)
    daily_log_id = Column(Integer, ForeignKey("daily_logs.id"))
    name = Column(String)
    calories = Column(Integer)
    macros = Column(JSON)
    photo_url = Column(String)
    is_barcode_scan = Column(Boolean, default=False)

    daily_log = relationship("DailyLog", back_populates="food_entries")

class MealPlan(Base):
    __tablename__ = "meal_plans"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    week_start_date = Column(Date)
    meals = Column(JSON)  # { "monday": [recipe_id1, recipe_id2], ... }

    user = relationship("User", back_populates="meal_plans")
