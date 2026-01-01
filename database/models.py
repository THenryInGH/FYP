"""
models.py
----------
This file defines the ORM models — Python classes that represent database tables.
Each class corresponds to a table, and each attribute corresponds to a column.

There are relationships, constraints, and JSON/vector fields.
"""

from sqlalchemy import Column, Integer, String, Text, ForeignKey, JSON, TIMESTAMP
from sqlalchemy.orm import relationship
# from sqlalchemy.dialects.postgresql import VECTOR
from database import Base
from sqlalchemy.types import UserDefinedType

# Define custom pgvector column type
class Vector(UserDefinedType):
    def get_col_spec(self, **kw):
        # Default to 768 dimensions, adjust if needed
        return "vector(768)"

    def bind_processor(self, dialect):
        def process(value):
            if value is not None:
                # Ensure vector values are stored as text "[0.1, 0.2, ...]"
                return str(value)
            return value
        return process

    def result_processor(self, dialect, coltype):
        def process(value):
            if value is not None:
                # Convert back from string to Python list
                return [float(x) for x in value.strip("[]").split(",")]
            return value
        return process

# 1️⃣ User Table
class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP)

    # Relationships (used for joins or cascades)
    chats = relationship("ChatHistory", back_populates="user")
    configs = relationship("ConfigurationHistory", back_populates="user")
    conversations = relationship("Conversation", back_populates="user")

# 2️⃣ Chat History Table
class ChatHistory(Base):
    __tablename__ = "chat_history"

    chat_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    prompt = Column(Text)
    response = Column(Text)
    created_at = Column(TIMESTAMP)

    # Relationship back to user
    user = relationship("User", back_populates="chats")


# 2️⃣b Conversation Table (multi-chat support)
class Conversation(Base):
    __tablename__ = "conversations"

    conversation_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String(200), nullable=True)
    created_at = Column(TIMESTAMP)
    updated_at = Column(TIMESTAMP)

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")


# 2️⃣c Message Table (one row per message)
class Message(Base):
    __tablename__ = "messages"

    message_id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(
        Integer, ForeignKey("conversations.conversation_id", ondelete="CASCADE"), index=True, nullable=False
    )
    role = Column(String(20), nullable=False)  # user | assistant | system
    content = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP)

    conversation = relationship("Conversation", back_populates="messages")

# 3️⃣ Configuration History Table
class ConfigurationHistory(Base):
    __tablename__ = "configuration_history"

    config_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"))
    intent_text = Column(Text)
    config_json = Column(JSON)  # stores ONOS configuration data
    status = Column(String(20), default="pending")
    applied_at = Column(TIMESTAMP)

    # Relationship back to user
    user = relationship("User", back_populates="configs")

# 4️⃣ Devices Table (for ONOS device/host info)
class Device(Base):
    __tablename__ = "devices"

    device_id = Column(String, primary_key=True)
    name = Column(String(100))
    type = Column(String(50))
    annotations = Column(JSON)
    extra_metadata = Column(JSON)  

# 5️⃣ Config Samples Table (for vector-based retrieval)

class ConfigSample(Base):
    __tablename__ = "config_samples"

    sample_id = Column(Integer, primary_key=True)
    category = Column(String(50))  # e.g., Connectivity, QoS, ACL
    intent_text = Column(Text)     # natural language intent
    config_json = Column(JSON)     # ONOS configuration example
    extra_metadata = Column(JSON)        # additional explanation
    embedding = Column(Vector())  # 768-d vector (sentence-transformers/all-mpnet-base-v2)
