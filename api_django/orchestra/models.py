from django.db import models
from django.contrib.auth.models import AbstractUser

class Role(models.Model):
    name = models.CharField("Sección", max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    def __str__(self): return self.name

class User(AbstractUser):
    roles = models.ManyToManyField(Role, related_name='members', blank=True)
    is_master = models.BooleanField("Es Master/Admin", default=False)

class ScoreCategory(models.Model):
    name = models.CharField("Conjunto", max_length=200)
    def __str__(self): return self.name

class Score(models.Model):
    title = models.CharField("Título", max_length=255)
    file = models.FileField("Archivo PDF", upload_to='scores/')
    category = models.ForeignKey(ScoreCategory, related_name='scores', on_delete=models.CASCADE)
    allowed_roles = models.ManyToManyField(Role, related_name='allowed_scores', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return self.title
