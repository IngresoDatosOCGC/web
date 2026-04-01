from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ScoreViewSet, ScoreCategoryViewSet, current_user
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'scores', ScoreViewSet, basename='score')
router.register(r'categories', ScoreCategoryViewSet, basename='category')

urlpatterns = [
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', current_user, name='current_user'),
    path('', include(router.urls)),
]
