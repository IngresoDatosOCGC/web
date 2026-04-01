from django.db import models
from django.contrib.auth.models import AbstractUser

class Role(models.Model):
    """
    Representa una sección de la orquesta (Ej. Violín I, Violonchelo, Percusión, Coro)
    Sirve como sistema de roles/permisos.
    """
    name = models.CharField("Nombre de la sección", max_length=100, unique=True)
    description = models.TextField("Descripción", blank=True, null=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    """
    Usuario extendido para la orquesta.
    Soporta múltiples roles (secciones) y puede ser maestro/admin.
    """
    roles = models.ManyToManyField(
        Role, 
        related_name='members', 
        blank=True, 
        help_text="Secciones de la orquesta a las que pertenece el músico."
    )
    is_master = models.BooleanField(
        "Es Master", 
        default=False, 
        help_text="Indica si el usuario tiene acceso completo a todas las partituras y gestión general."
    )

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.username})".strip() or self.username

class ScoreCategory(models.Model):
    """
    Agrupaciones de partituras (Ej. Concierto Noviembre 2025, Documental)
    """
    name = models.CharField("Nombre del conjunto", max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Score(models.Model):
    """
    Partitura o archivo subido. 
    Se restringe a ciertos roles (secciones), si está vacío se asume acceso global (o restringido, según convenga).
    """
    title = models.CharField("Título de la partitura", max_length=255)
    file = models.FileField("Archivo", upload_to='scores/')
    category = models.ForeignKey(ScoreCategory, related_name='scores', on_delete=models.CASCADE, null=True, blank=True)
    
    # Aquí está la magia del control de acceso
    allowed_roles = models.ManyToManyField(
        Role, 
        related_name='allowed_scores', 
        blank=True,
        help_text="Deja vacío si quieres que todos los miembros puedan verla, o selecciona secciones específicas que tienen permiso."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
