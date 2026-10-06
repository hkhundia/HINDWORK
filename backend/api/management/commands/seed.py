from django.core.management.base import BaseCommand
from api.models import User, Job

class Command(BaseCommand):
    help = "Create demo users and jobs (password for all: demo1234)"
    def handle(self, *a, **k):
        F = [("priya", "Roorkee", "logo,canva,photoshop,packaging", 400), ("aman", "Dehradun", "react,css,next.js", 600),
             ("sneha", "Pune", "translation,marathi,content writing", 350), ("rohit", "Haridwar", "video editing,reels,premiere pro", 450)]
        for n, c, s, r in F:
            User.objects.get_or_create(username=n, defaults=dict(role="freelancer", city=c, skills=s, hourly_rate=r))
        E = {n: User.objects.get_or_create(username=n, defaults=dict(role="employer"))[0] for n in ["rahul", "anita", "karan", "meera"]}
        for u in User.objects.all():
            u.set_password("demo1234"); u.save()
        J = [("rahul", "Logo for my bakery", "Design", 3000, 5, "Hindi", "logo,canva"), ("anita", "Hindi typing, 40 pages", "Typing", 1800, 3, "Hindi", "hindi typing"),
             ("karan", "Instagram reels editing", "Video", 5000, 7, "English", "video editing,reels"), ("meera", "Landing page in React", "Coding", 9000, 10, "English", "react,css")]
        for e, t, c, b, d, l, s in J:
            Job.objects.get_or_create(title=t, defaults=dict(employer=E[e], description=t + ". Details shared after hiring.", category=c, budget=b, days=d, language=l, skills=s))
        self.stdout.write("Seeded. Login e.g. priya / demo1234 (freelancer), rahul / demo1234 (employer)")
