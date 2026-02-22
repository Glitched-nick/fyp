"""
SQLAlchemy ORM models for database tables
"""
from sqlalchemy import Column, Integer, Float, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Interview(Base):
    """
    Interview results table
    Stores all computed metrics and scores
    """
    __tablename__ = "interviews"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Facial/behavioral metrics (0-1 normalized)
    eye_contact_score = Column(Float, nullable=False)
    head_stability_score = Column(Float, nullable=False)
    smile_score = Column(Float, nullable=False)
    face_presence_percentage = Column(Float, nullable=False)
    
    # Speech metrics
    speech_rate = Column(Float, nullable=False)  # Words per minute
    filler_percentage = Column(Float, nullable=False)  # Percentage of filler words
    pitch_mean = Column(Float, nullable=False)  # Average pitch in Hz
    pitch_variance = Column(Float, nullable=False)  # Pitch stability
    energy_stability = Column(Float, nullable=False)  # RMS energy variance
    
    # Overall confidence score (0-100)
    confidence_score = Column(Integer, nullable=False)
    
    # Feedback text (JSON stored as string)
    strengths = Column(String, nullable=True)
    improvements = Column(String, nullable=True)
    
    # Metadata
    video_duration = Column(Float, nullable=True)  # Duration in seconds
    transcript = Column(String, nullable=True)  # Full transcript


class AIInterviewSession(Base):
    """
    AI Interview Session table
    Stores resume, job description, and generated questions
    """
    __tablename__ = "ai_interview_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, unique=True, index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Input data
    resume_text = Column(Text, nullable=False)
    job_description = Column(Text, nullable=False)
    
    # Generated questions (JSON stored as string)
    questions = Column(Text, nullable=False)
    
    # Session metadata
    num_questions = Column(Integer, default=5)
    status = Column(String, default="active")  # active, completed, abandoned
    
    # Relationship to answers
    answers = relationship("AIInterviewAnswer", back_populates="session", cascade="all, delete-orphan")


class AIInterviewAnswer(Base):
    """
    AI Interview Answer table
    Stores user answers and their analysis
    """
    __tablename__ = "ai_interview_answers"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("ai_interview_sessions.session_id"), nullable=False)
    question_index = Column(Integer, nullable=False)
    
    # Answer data
    answer_text = Column(Text, nullable=False)
    answer_duration = Column(Float, nullable=False)  # Duration in seconds
    
    # Analysis results
    score = Column(Integer, nullable=False)  # 0-100
    feedback = Column(Text, nullable=True)
    relevance_score = Column(Integer, nullable=True)
    completeness_score = Column(Integer, nullable=True)
    clarity_score = Column(Integer, nullable=True)
    word_count = Column(Integer, nullable=True)
    
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    session = relationship("AIInterviewSession", back_populates="answers")
