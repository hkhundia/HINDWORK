from django.db.models import Avg
from rest_framework import serializers
from .models import User, Job, Proposal, Contract, Transaction, Review

class UserSerializer(serializers.ModelSerializer):
    rating = serializers.SerializerMethodField()
    password = serializers.CharField(write_only=True, min_length=6)
    class Meta:
        model = User
        fields = ["id", "username", "password", "role", "phone", "language", "city", "bio", "skills", "hourly_rate", "rating"]
    def get_rating(self, u):
        r = u.reviews_received.aggregate(a=Avg("rating"))["a"]
        return round(r, 1) if r else None
    def create(self, data):
        return User.objects.create_user(**data)

class JobSerializer(serializers.ModelSerializer):
    employer_name = serializers.CharField(source="employer.username", read_only=True)
    class Meta:
        model = Job
        fields = "__all__"
        read_only_fields = ["employer", "status"]

class ProposalSerializer(serializers.ModelSerializer):
    freelancer_name = serializers.CharField(source="freelancer.username", read_only=True)
    class Meta:
        model = Proposal
        fields = "__all__"
        read_only_fields = ["job", "freelancer", "status"]

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = "__all__"

class ContractSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source="job.title", read_only=True)
    transactions = TransactionSerializer(many=True, read_only=True)
    class Meta:
        model = Contract
        fields = "__all__"

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ["id", "rating", "comment", "to_user"]
        read_only_fields = ["to_user"]
