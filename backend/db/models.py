from sqlalchemy import (
    Column, Integer, String, Float, Text,
    TIMESTAMP, ForeignKey, JSON
)
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()


# ---------------------------
# User Table
# ---------------------------
class User(Base):
    __tablename__ = "user"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    age = Column(Integer, nullable=True)
    location = Column(String, nullable=True)
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    # Relationships
    events = relationship("UserMovieEvent", back_populates="user")


# ---------------------------
# Movie Table
# ---------------------------
class Movie(Base):
    __tablename__ = "movie"

    movie_id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    genres = Column(String, nullable=True)
    poster_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    release_year = Column(Integer, nullable=True)
    metadata_json = Column(JSON, nullable=True)

    # Relationships
    events = relationship("UserMovieEvent", back_populates="movie")


# ---------------------------
# User-Movie Event Table
# ---------------------------
class UserMovieEvent(Base):
    __tablename__ = "user_movie_event"

    event_id = Column(Integer, primary_key=True, index=True)
    
    user_id = Column(Integer, ForeignKey("user.user_id"), nullable=False)
    movie_id = Column(Integer, ForeignKey("movie.movie_id"), nullable=False)

    event_type = Column(String, nullable=False)  # "watched" or "rated"
    rating = Column(Float, nullable=True)
    watched_at = Column(TIMESTAMP, nullable=True)  # NULL = unordered past watch
    created_at = Column(TIMESTAMP, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="events")
    movie = relationship("Movie", back_populates="events")
