from aiogram import Router
from aiogram.types import Message

router = Router()

# This router handles webhook-triggered notifications from the backend
# Actual notifications are sent via notify.py utility
