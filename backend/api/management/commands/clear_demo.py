from django.core.management.base import BaseCommand
from api.models import User

DEMO = ["priya", "aman", "sneha", "rohit", "rahul", "anita", "karan", "meera"]

class Command(BaseCommand):
    help = "Delete the demo users created by `seed --demo`, and everything linked to them (jobs, proposals, contracts, reviews)."
    def handle(self, *a, **k):
        qs = User.objects.filter(username__in=DEMO)
        n = qs.count()
        qs.delete()
        self.stdout.write(f"Removed {n} demo users and all data linked to them.")
