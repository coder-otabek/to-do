from django.urls import path
from django.contrib.auth import views as auth_views
from .views import *

urlpatterns = [
    path('', index, name='home'),

    path('profile/', profile, name='profile'),
    path('logout/', logout_view, name='logout'),
    path('register/', register, name='register'),
    path('login/', login_view, name='login'),

    path('profile_change/', profile_change, name='profile_change'),
    path('change_password/', change_password, name='change_password'),

    path('forgot_password/', auth_views.PasswordResetView.as_view(
        template_name='forgot_password.html'), name='password_reset'),

    path('forgot_password_done/', auth_views.PasswordResetDoneView.as_view(
        template_name='forgot_password_done.html'), name='password_reset_done'),

    path('reset/<uidb64>/<token>/',
         auth_views.PasswordResetConfirmView.as_view(
             template_name='password_reset_confirm.html'),
         name='password_reset_confirm'),

    path('reset_done/', auth_views.PasswordResetCompleteView.as_view(
        template_name='password_reset_complete.html'),
         name='password_reset_complete'),

    # CRUD
    path('created/', created, name='created'),
    path('edit/<int:pk>/', edit, name='edit'),
    path('delete/<int:pk>/', delete, name='delete'),
]