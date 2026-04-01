from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Role, Score, ScoreCategory

class CustomUserAdmin(UserAdmin):
    """
    Extiende el panel del usuario en el Administrador de Django 
    y añade las secciones de orquesta (roles) y los flags en el panel visual.
    """
    model = User
    fieldsets = UserAdmin.fieldsets + (
        ('Orquesta (Roles y Permisos)', {'fields': ('roles', 'is_master')}),
    )
    filter_horizontal = ('roles',) # Agregará un selector visual dual que es perfecto para esto
    list_display = ['username', 'email', 'get_roles', 'is_master', 'is_staff']
    
    def get_roles(self, obj):
        # Muestra en columnas las secciones al visualizar usuarios en el Admin Panel
        return ", ".join([r.name for r in obj.roles.all()])
    get_roles.short_description = 'Secciones'

class ScoreAdmin(admin.ModelAdmin):
    """
    Mejora visual para subir y clasificar partituras desde el Admin Dashboard.
    """
    list_display = ('title', 'category', 'get_allowed_roles', 'created_at')
    list_filter = ('category', 'allowed_roles')
    search_fields = ('title',)
    filter_horizontal = ('allowed_roles',) # Selector visual múltiple

    def get_allowed_roles(self, obj):
        # Muestra a qué secciones está limitada la obra (vacío = a todas)
        names = [r.name for r in obj.allowed_roles.all()]
        return ", ".join(names) if names else "Pública para todos los miembros"
    get_allowed_roles.short_description = 'Permisos por sección'

# Registramos los modelos en el panel para que el Master/Admin los pueda ver y modificar
admin.site.register(User, CustomUserAdmin)
admin.site.register(Role)
admin.site.register(ScoreCategory)
admin.site.register(Score, ScoreAdmin)
