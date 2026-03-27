from django.db import models
from django.contrib.auth.models import User
from .constants import TODO


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')

    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True, default='avatars/default.png')
    full_name = models.CharField(max_length=50, blank=True, null=True)
    phone = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return self.user.username


class Todo(models.Model):
    author = models.ForeignKey(Profile, on_delete=models.CASCADE)
    status = models.IntegerField(choices=TODO.STATUS.Constants, default=0)
    priority = models.IntegerField(choices=TODO.PRIORITY.Constants, default=2)
    deadline = models.DateField(null=True, blank=True)
    title = models.CharField(max_length=202)
    content = models.TextField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-priority']

    def __str__(self):
        return self.title