from django.contrib import admin

from .models import Todo, UserConfirmation


admin.site.register(UserConfirmation)
admin.site.register(Todo)