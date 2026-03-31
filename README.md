# Django Authentication & Todo API

Ushbu loyiha Django REST Framework yordamida yaratilgan bo'lib, foydalanuvchilarni ro'yxatdan o'tkazish (Email/Telefon orqali), profilni boshqarish va shaxsiy Todo (vazifalar) ro'yxatini yuritish imkoniyatini beradi.

## 🚀 Imkoniyatlar

### 1. Foydalanuvchi Boshqaruvi (Auth)
* **Ro'yxatdan o'tish:** Email yoki Telefon orqali sign-up.
* **Tasdiqlash:** OTP kod yordamida profilni faollashtirish.
* **JWT Login:** Access va Refresh tokenlar yordamida xavfsiz kirish.
* **Profil:** Ma'lumotlarni tahrirlash (Username, Ism, Familiya) va profil rasmini yuklash.
* **Parol:** Parolni unutgan holatlarda tiklash va parolni o'zgartirish.

### 2. Todo API (CRUD)
* Foydalanuvchilar faqat o'zlariga tegishli vazifalarni ko'ra oladilar.
* Vazifalarni yaratish, tahrirlash (PATCH/PUT) va o'chirish.
* Holat (Status) va Muhimlik (Priority) darajalari bo'yicha boshqarish.

## 🛠 Texnologiyalar
* **Framework:** Django 5.1.4
* **API:** Django REST Framework
* **Token:** SimpleJWT (JSON Web Token)
* **Database:** SQLite (Standart)

## 📁 Loyiha Strukturasi
Loyiha quyidagi papkalarga (Collection) ajratilgan:
- **Registration:** Foydalanuvchini ro'yxatga olish.
- **Login & Token:** Kirish va tokenni yangilash.
- **Profile:** Shaxsiy ma'lumotlar boshqaruvi.
- **Todo:** Vazifalar bilan ishlash.

## ⚙️ O'rnatish

1. Virtual muhitni yarating va ishga tushiring:
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   venv\Scripts\activate     # Windows