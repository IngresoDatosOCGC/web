from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Score, User, ScoreCategory
from .serializers import ScoreSerializer, UserSerializer, ScoreCategorySerializer
from django.db.models import Q

class ScoreViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ScoreSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_master or user.is_superuser:
            return Score.objects.all()
        # Solo ve lo de su sección/rol o lo que sea para todos (sin roles asignados)
        return Score.objects.filter(
            Q(allowed_roles__in=user.roles.all()) | Q(allowed_roles__isnull=True)
        ).distinct()

class ScoreCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ScoreCategory.objects.all()
    serializer_class = ScoreCategorySerializer

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)
