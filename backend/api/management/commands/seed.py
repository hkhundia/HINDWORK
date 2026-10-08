from django.core.management.base import BaseCommand
from api.models import User, Job

class Command(BaseCommand):
    help = "Create demo users and jobs (password for all: demo1234)"
    def add_arguments(self, p):
        p.add_argument("--demo", action="store_true", help="Confirms you want FAKE demo data (local test databases only)")

    def handle(self, *a, **k):
        if not k.get("demo"):
            self.stdout.write("Refusing to seed: this creates FAKE demo users with a known password. Use --demo only on a local test database.")
            return
        F = [("priya", "Roorkee", "logo,canva,photoshop,packaging", 400), ("aman", "Dehradun", "react,css,next.js", 600),
             ("sneha", "Pune", "translation,marathi,content writing", 350), ("rohit", "Haridwar", "video editing,reels,premiere pro", 450)]
        for n, c, s, r in F:
            User.objects.get_or_create(username=n, defaults=dict(role="freelancer", city=c, skills=s, hourly_rate=r))
        E = {n: User.objects.get_or_create(username=n, defaults=dict(role="employer"))[0] for n in ["rahul", "anita", "karan", "meera"]}
        for u in User.objects.all():
            u.set_password("demo1234"); u.save()
        J = [("rahul", "Logo for my bakery", "Design", 3000, 5, "Hindi", "logo,canva"), ("anita", "Hindi typing, 40 pages", "Typing", 1800, 3, "Hindi", "hindi typing"),
             ("karan", "Instagram reels editing", "Video", 5000, 7, "English", "video editing,reels"), ("meera", "Landing page in React", "Coding", 9000, 10, "English", "react,css")]
        J += [("anita", "Hindi data entry, 500 rows", "Typing", 1500, 2, "Hindi", "hindi typing"), ("rahul", "Poster for Diwali sale", "Design", 1200, 2, "Hindi", "canva,photoshop"),
              ("karan", "Product video edit", "Video", 4000, 5, "English", "video editing,premiere pro"), ("meera", "Fix bugs in React site", "Coding", 6000, 4, "English", "react,css"),
              ("anita", "Packaging design for sweets", "Design", 3800, 6, "Hindi", "packaging,logo"), ("karan", "Translate website to Marathi", "Writing", 2600, 5, "Marathi", "translation,marathi"),
              ("rahul", "Menu card design", "Design", 2200, 3, "Hindi", "canva,logo"), ("meera", "Next.js dashboard", "Coding", 12000, 12, "English", "next.js,react")]
        for e, t, c, b, d, l, s in J:
            Job.objects.get_or_create(title=t, defaults=dict(employer=E[e], description=t + ". Details shared after hiring.", category=c, budget=b, days=d, language=l, skills=s))
        self.stdout.write("Seeded. Login e.g. priya / demo1234 (freelancer), rahul / demo1234 (employer)")
