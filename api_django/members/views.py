from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Score, User, Role, ScoreCategory
from .serializers import ScoreSerializer, UserSerializer, RoleSerializer, ScoreCategorySerializer
from django.db.models import Q

class IsMasterOrReadOnly(permissions.BasePermission):
    """
    Permite acceso de solo lectura a usuarios normales.
    Para crear/borrar, requiere que sea 'master'.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        return request.user and request.user.is_authenticated and (request.user.is_master or request.user.is_superuser)

class ScoreViewSet(viewsets.ModelViewSet):
    """
    Vista principal de la API para las partituras.
    Aquí se gestiona el filtrado dinámico según la sección (Rol) del usuario que hace la petición.
    """
    serializer_class = ScoreSerializer
    permission_classes = [permissions.IsAuthenticated, IsMasterOrReadOnly]

    def get_queryset(self):
        user = self.request.user
        
        # Un master (o admin) puede ver todas las partituras sin restricción
        if user.is_master or user.is_superuser:
            return Score.objects.all().order_by('-created_at')
        
        # Filtro de roles: Traemos las obras donde "allowed_roles" del Score
        # coincida con los "roles" que tiene el Usuario. 
        # O si "allowed_roles" está vacío, significa que es público para todos.
        user_roles = user.roles.all()
        
        return Score.objects.filter(
            Q(allowed_roles__in=user_roles) | Q(allowed_roles__isnull=True)
        ).distinct().order_by('-created_at')

class ScoreCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """ Solo permitimos lectura de categorias a los usuarios, solo el admin las crea """
    queryset = ScoreCategory.objects.all().order_by('-created_at')
    serializer_class = ScoreCategorySerializer
    permission_classes = [permissions.IsAuthenticated]

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_user(request):
    """ Retorna los datos y roles del usuario actual que ha iniciado sesión """
    serializer = UserSerializer(request.user)
    return Response(serializer.data)
