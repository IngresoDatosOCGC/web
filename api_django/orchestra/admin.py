from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Role, Score, ScoreCategory

class CustomUserAdmin(UserAdmin):
    model = User
    fieldsets = UserAdmin.fieldsets + (
        ('Roles OCGC', {'fields': ('roles', 'is_master')}),
    )
    filter_horizontal = ('roles',)

admin.site.register(User, CustomUserAdmin)
admin.site.register(Role)
admin.site.register(ScoreCategory)
admin.site.register(Score)
