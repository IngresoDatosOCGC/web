from rest_framework import serializers
from .models import User, Role, Score, ScoreCategory

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = ['id', 'name', 'description']

class ScoreCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ScoreCategory
        fields = ['id', 'name']

class ScoreSerializer(serializers.ModelSerializer):
    category = ScoreCategorySerializer()
    class Meta:
        model = Score
        fields = ['id', 'title', 'file', 'category']

class UserSerializer(serializers.ModelSerializer):
    roles = RoleSerializer(many=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'roles', 'is_master']
