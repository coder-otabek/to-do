from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from django.contrib.auth.password_validation import validate_password
from django.core.validators import FileExtensionValidator
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import serializers
from rest_framework.exceptions import ValidationError, PermissionDenied, NotFound
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenRefreshSerializer
from rest_framework_simplejwt.tokens import AccessToken

from shared.utiliy import send_email, check_email_or_phone, check_user_type
from .models import User, VIA_PHONE, VIA_EMAIL, CODE_VERIFIED, NEW, DONE, PHOTO_DONE, Todo


class SignUpSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)

    def __init__(self, *args, **kwargs):
        super(SignUpSerializer, self).__init__(*args, **kwargs)
        self.fields['email_phone_number'] = serializers.CharField(required=True, write_only=True)

    class Meta:
        model = User
        fields = ('id', 'auth_type', 'status')
        extra_kwargs = {
            'auth_type': {'read_only': True, 'required': False},
            'status': {'read_only': True, 'required': False},
        }

    def validate(self, data):
        user_input = str(data.get('email_phone_number')).lower()
        input_type = check_email_or_phone(user_input)

        if input_type == 'email':
            data['email'] = user_input
            data['auth_type'] = VIA_EMAIL
        elif input_type == 'phone':
            data['phone'] = user_input
            data['auth_type'] = VIA_PHONE
        else:
            raise ValidationError({
                'success': False,
                "message": "Telefon raqam yoki emailda xatolik"
            })

        data.pop('email_phone_number', None)
        return data

    def validate_email_phone_number(self, value):
        value = value.lower()
        if User.objects.filter(email=value).exists() or User.objects.filter(phone=value).exists():
            raise ValidationError({
                'success': False,
                "message": "Foydalanuvchi allaqachon mavjud"
            })
        return value

    def create(self, validated_data):
        user = super(SignUpSerializer, self).create(validated_data)
        if user.auth_type == VIA_EMAIL:
            code = user.create_verify_code(VIA_EMAIL)
            send_email(user.email, code)
        elif user.auth_type == VIA_PHONE:
            code = user.create_verify_code(VIA_PHONE)
            send_email(user.email, code)
        user.save()
        return user

    def to_representation(self, instance):
        data = super(SignUpSerializer, self).to_representation(instance)
        data.update(instance.token())
        return data


class ChangeUserInformation(serializers.Serializer):
    first_name = serializers.CharField(required=True, write_only=True)
    last_name = serializers.CharField(required=True, write_only=True)
    username = serializers.CharField(required=True, write_only=True)
    password = serializers.CharField(required=True, write_only=True)
    confirm_password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        password = data.get('password')
        confirm_password = data.get('confirm_password')
        if password != confirm_password:
            raise ValidationError({'message': 'Passwords must match'})
        if password:
            validate_password(password)
        return data

    def validate_username(self, username):
        if len(username) < 6 or len(username) > 20:
            raise ValidationError({'message': 'Username must be between 6 and 20 characters'})
        if username.isdigit():
            raise ValidationError({'message': 'Username must not be number'})
        user = self.context['request'].user
        if User.objects.filter(username=username).exclude(id=user.id).exists():
            raise ValidationError({'success': False, 'message': 'Username band'})
        return username

    def update(self, instance, validated_data):
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.username = validated_data.get('username', instance.username)
        password = validated_data.get('password')
        if password:
            instance.set_password(password)
        if instance.status == CODE_VERIFIED:
            instance.status = DONE
        instance.save()
        return instance


class ChangeUserPhotoSerializer(serializers.Serializer):
    photo = serializers.ImageField(validators=[FileExtensionValidator(['jpg', 'png', 'jpeg', 'heic', 'heif'])])

    def update(self, instance, validated_data):
        photo = validated_data.get('photo')
        if photo:
            instance.photo = photo
            instance.status = PHOTO_DONE
            instance.save()
        return instance


class LoginSerializer(TokenObtainPairSerializer):
    userinput = serializers.CharField(required=True)

    def __init__(self, *args, **kwargs):
        super(LoginSerializer, self).__init__(*args, **kwargs)
        if 'username' in self.fields:
            self.fields.pop('username')

    def validate(self, data):
        user_input = data.get('userinput')
        password = data.get('password')
        user_type = check_user_type(user_input)

        filter_kwargs = {}
        if user_type == 'username':
            filter_kwargs = {'username__iexact': user_input}
        elif user_type == 'email':
            filter_kwargs = {'email__iexact': user_input}
        elif user_type == 'phone':
            filter_kwargs = {'phone': user_input}
        else:
            raise ValidationError({'message': 'Xato kiritish'})

        user_obj = User.objects.filter(**filter_kwargs).first()
        if not user_obj:
            raise ValidationError({'message': 'User topilmadi'})

        if user_obj.status in [CODE_VERIFIED, NEW]:
            raise ValidationError({'message': "To'liq ro'yxatdan o'ting"})

        user = authenticate(username=user_obj.username, password=password)
        if not user:
            raise ValidationError({'message': "Parol noto'g'ri"})

        self.user = user
        refresh = self.get_token(self.user)
        return {
            'access': str(refresh.access_token),
            'refresh_token': str(refresh),
            'status': self.user.status,
            'full_name': self.user.get_full_name()
        }


class LoginRefreshSerializer(TokenRefreshSerializer):
    def validate(self, data):
        data = super().validate(data)
        access_token_instance = AccessToken(data['access'])
        user_id = access_token_instance['user_id']
        user = get_object_or_404(User, id=user_id)
        update_last_login(None, user)
        return data


class LogOutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


class ForgetPasswordSerializer(serializers.Serializer):
    email_or_phone_number = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        val = attrs.get('email_or_phone_number')
        user = User.objects.filter(Q(phone=val) | Q(email=val))
        if not user.exists():
            raise NotFound({'message': 'User not found'})
        attrs['user'] = user.first()
        return attrs


class ResetPasswordSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(read_only=True)
    password = serializers.CharField(min_length=8, write_only=True, required=True)
    confirm_password = serializers.CharField(min_length=8, write_only=True, required=True)

    class Meta:
        model = User
        fields = ('id', 'password', 'confirm_password')

    def validate(self, data):
        if data.get('password') != data.get('confirm_password'):
            raise ValidationError({'message': "Passwords don't match"})
        validate_password(data.get('password'))
        return data

    def update(self, instance, validated_data):
        instance.set_password(validated_data.pop('password'))
        instance.save()
        return instance


class TodoSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)

    class Meta:
        model = Todo
        fields = [
            'id', 'title', 'content',
            'status', 'status_display',
            'priority', 'priority_display',
            'deadline', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']