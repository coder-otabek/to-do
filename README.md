"""
PROJECT: MyToDo System
DEVELOPER: Abdumalikov Otabek
STACK: Django (MVT), SQLite, Ubuntu 24.04
"""

# --- MODELLAR STRUKTURASI ---
class ProfileInfo:
    """Foydalanuvchi shaxsiy ma'lumotlari"""
    fields = ['user', 'avatar', 'full_name', 'phone']
    relations = "OneToOneField -> auth.User"

class TodoTask:
    """Vazifalar boshqaruvi"""
    fields = ['author', 'title', 'content', 'status', 'priority', 'deadline']
    ordering = ['-priority'] # Muhimlik darajasi bo'yicha

# --- KONSTANTALAR (TODO) ---
STATUS_CHOICES = {
    0: 'New',
    1: 'Process',
    2: 'Completed',
    3: 'Cancelled'
}

PRIORITY_LEVELS = {
    0: 'Lowest',
    1: 'Low',
    2: 'Medium',
    3: 'High',
    4: 'Highest'
}

# --- FUNKSIONAL IMKONIYATLAR (VIEWS) ---
CORE_LOGIC = {
    "Authentication": [
        "Login/Logout tizimi", 
        "Custom Registration (full_name bilan)", 
        "Password Change (xavfsiz yangilash)"
    ],
    "Task_Operations": [
        "Create: Yangi vazifa qo'shish",
        "Read: Status, Priority va Qidiruv (q) bo'yicha filtrlash",
        "Update: Mavjud vazifani tahrirlash",
        "Delete: Vazifani o'chirish (tasdiqlash bilan)"
    ],
    "Profile_Management": [
        "Profil ma'lumotlarini yangilash",
        "Username va Email bandligini tekshirish (Validation)",
        "Avatar yuklash imkoniyati"
    ]
}

# --- XAVFSIZLIK VA MUHIT ---
SECURITY_CONFIG = {
    "Access": "@login_required dekoratorlari orqali himoyalangan",
    "Data": "Sensitive ma'lumotlar (token, id) .env faylda saqlanadi",
    "OS": "Ubuntu 24.04 LTS"
}# to-do
