from rest_framework import serializers
from .models import User, Role, Score, ScoreCategory

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'description']

class ScoreCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ScoreCategory
        fields = ['id', 'name', 'created_at']

class ScoreSerializer(serializers.ModelSerializer):
    allowed_roles = RoleSerializer(many=True, read_only=True)
    category = ScoreCategorySerializer(read_only=True)
    file_url = serializers.FileField(source='file', use_url=True)

    class Meta:
        model = Score
        fields = ['id', 'title', 'file_url', 'category', 'allowed_roles', 'created_at']

class UserSerializer(serializers.ModelSerializer):
    roles = RoleSerializer(many=True, read_only=True)
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'roles', 'is_master', 'is_staff']
