from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    role = models.CharField(max_length=12, choices=[("freelancer", "Freelancer"), ("employer", "Employer")], default="freelancer")
    phone = models.CharField(max_length=15, blank=True)
    language = models.CharField(max_length=20, default="Hindi")
    city = models.CharField(max_length=60, blank=True)
    bio = models.TextField(blank=True)
    skills = models.CharField(max_length=300, blank=True, help_text="comma separated")
    hourly_rate = models.PositiveIntegerField(default=0)

    def skill_list(self):
        return [s.strip().lower() for s in self.skills.split(",") if s.strip()]

class Job(models.Model):
    employer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="jobs")
    title = models.CharField(max_length=150)
    description = models.TextField()
    category = models.CharField(max_length=40)
    budget = models.PositiveIntegerField()
    days = models.PositiveIntegerField(default=7)
    language = models.CharField(max_length=20, default="Hindi")
    skills = models.CharField(max_length=300, blank=True)
    status = models.CharField(max_length=12, default="open", choices=[("open", "Open"), ("in_progress", "In progress"), ("completed", "Completed")])
    created = models.DateTimeField(auto_now_add=True)

    def skill_list(self):
        return [s.strip().lower() for s in self.skills.split(",") if s.strip()]

class Proposal(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name="proposals")
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="proposals")
    price = models.PositiveIntegerField()
    days = models.PositiveIntegerField()
    message = models.TextField(blank=True)
    status = models.CharField(max_length=10, default="pending", choices=[("pending", "Pending"), ("accepted", "Accepted"), ("rejected", "Rejected")])
    class Meta:
        unique_together = ("job", "freelancer")

class Contract(models.Model):
    """One hired freelancer per job. `stage` is the escrow state machine."""
    job = models.OneToOneField(Job, on_delete=models.CASCADE, related_name="contract")
    freelancer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="contracts_as_freelancer")
    employer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="contracts_as_employer")
    amount = models.PositiveIntegerField()
    razorpay_order_id = models.CharField(max_length=60, blank=True)
    stage = models.CharField(max_length=10, default="hired", choices=[(x, x) for x in ["hired", "funded", "working", "delivered", "paid", "disputed"]])
    created = models.DateTimeField(auto_now_add=True)

class Transaction(models.Model):
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, related_name="transactions")
    kind = models.CharField(max_length=10, choices=[("deposit", "deposit"), ("release", "release"), ("refund", "refund")])
    amount = models.PositiveIntegerField()
    gateway_ref = models.CharField(max_length=60)
    created = models.DateTimeField(auto_now_add=True)

class Review(models.Model):
    contract = models.ForeignKey(Contract, on_delete=models.CASCADE, related_name="reviews")
    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reviews_given")
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reviews_received")
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)
    class Meta:
        unique_together = ("contract", "from_user")
