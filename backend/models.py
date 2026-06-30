from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    tier = Column(Enum("FREE", "PRO"), default="FREE")
    created_at = Column(DateTime, default=datetime.utcnow)

    albums = relationship("Album", back_populates="owner")
    images = relationship("Image", back_populates="owner")


class Album(Base):
    __tablename__ = "albums"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="albums")
    images = relationship("Image", back_populates="album")


class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    album_id = Column(Integer, ForeignKey("albums.id"), nullable=True)
    s3_key = Column(String(500), nullable=False)
    cdn_url = Column(String(1000))
    thumbnail_url = Column(String(1000))
    size = Column(BigInteger, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="images")
    album = relationship("Album", back_populates="images")
