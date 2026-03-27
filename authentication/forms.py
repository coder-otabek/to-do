from django import forms
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.forms.widgets import TextInput, EmailInput
from django.contrib.auth import password_validation
from django.core.exceptions import ValidationError

from django.forms import ModelForm
from django.contrib.auth.models import User

from .models import Profile,Todo


class CustomUserRegistrationForm(UserCreationForm):
    full_name = forms.CharField(required=True, widget=forms.TextInput(attrs={
        'class': 'form__input',
        'placeholder': 'Ism va familiya'
    }))
    email = forms.EmailField(required=True, widget=forms.EmailInput(attrs={
        'class': 'form__input',
        'placeholder': 'Email manzilingiz'
    }))


    class Meta:
        model = User
        fields = ['username', 'email']

        widgets = {
            'username': forms.TextInput(attrs={
                'class': 'form__input',
                'placeholder': 'Foydalanuvchi nomi'
            }),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Parol maydonlariga stil berish
        self.fields['password1'].widget.attrs.update({
            'class': 'form__input',
            'placeholder': 'Parol yarating'
        })
        self.fields['password2'].widget.attrs.update({
            'class': 'form__input',
            'placeholder': 'Parolni tasdiqlang'
        })

    def save(self, commit=True):
        user = super().save(commit=False)
        full_name = self.cleaned_data.get('full_name')
        name_parts = full_name.split(' ', 1)

        user.first_name = name_parts[0]
        if len(name_parts) > 1:
            user.last_name = name_parts[1]

        if commit:
            user.save()
        return user



class ChangeProfileForm(forms.ModelForm):
    username = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form__input',
            'placeholder': 'Username'
        })
    )
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={
            'class': 'form__input',
            'placeholder': 'Email manzil'
        })
    )
    full_name = forms.CharField(
        required=True,
        widget=forms.TextInput(attrs={
            'class': 'form__input',
            'placeholder': "Ism va Familiya"
        })
    )

    class Meta:
        model = Profile
        fields = ['avatar', 'phone']

        widgets = {
            'avatar': forms.FileInput(attrs={
                'id': 'id_avatar',
                'accept': 'image/*',
                'onchange': 'loadFile(event)',
                'style': 'display: none;'
            }),
            'phone': forms.TextInput(attrs={
                'class': 'form__input',
                'placeholder': 'Telefon raqam'
            }),
        }

    def __init__(self, *args, **kwargs):
        # user ni view'dan uzatish uchun
        self.user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)

    def clean_username(self):
        username = self.cleaned_data.get('username')
        if self.user and User.objects.filter(username=username).exclude(id=self.user.id).exists():
            raise ValidationError("Bu username band!")
        return username

    def clean_email(self):
        email = self.cleaned_data.get('email')
        if self.user and User.objects.filter(email=email).exclude(id=self.user.id).exists():
            raise ValidationError("Bu email band!")
        return email

class TodoForms(forms.ModelForm):
    class Meta:
        model = Todo
        fields = ['status', 'priority', 'deadline', 'title', 'content'] # author exclude qilingan

    def __init__(self, *args, **kwargs):
        super(TodoForms, self).__init__(*args, **kwargs)
        for field_name, field in self.fields.items():
            field.widget.attrs.update({
                'class': 'form-control',
                'placeholder': field_name.capitalize()
            })

class PasswordChangeForm(forms.Form):
    old_password = forms.CharField(label="Eski parol", widget=forms.PasswordInput(), strip=False)
    new_password1 = forms.CharField(label="Yangi parol", widget=forms.PasswordInput(), strip=False)
    new_password2 = forms.CharField(label="Yangi parolni tasdiqlash", widget=forms.PasswordInput(), strip=False)

    def __init__(self, user, *args, **kwargs):
        self.user = user
        super().__init__(*args, **kwargs)
        for name, field in self.fields.items():
            field.widget.attrs.update({"class": "form-control", "autocomplete": "off"})

    def clean_old_password(self):
        old_password = self.cleaned_data.get("old_password")
        if not self.user.check_password(old_password):
            raise ValidationError("Eski parol noto‘g‘ri.")
        return old_password

    def clean(self):
        cleaned = super().clean()
        p1 = cleaned.get("new_password1")
        p2 = cleaned.get("new_password2")
        if p1 and p2 and p1 != p2:
            self.add_error("new_password2", "Yangi parollar mos kelmadi.")
        return cleaned

    def save(self, commit=True):
        self.user.set_password(self.cleaned_data["new_password1"])
        if commit:
            self.user.save()
        return self.user