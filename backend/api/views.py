import uuid, os, json, hmac, hashlib, base64, urllib.request
from django.db.models import Q, Avg, Count, Sum
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from .models import User, Job, Proposal, Contract, Transaction, Review
from collections import Counter
from . import ai
from .serializers import *

def err(msg, code=400):
    return Response({"detail": msg}, status=code)

# ---------- auth ----------
@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    s = UserSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    user = s.save()
    return Response({"token": Token.objects.get_or_create(user=user)[0].key, "user": UserSerializer(user).data}, 201)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)

# ---------- jobs ----------
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticatedOrReadOnly])
def jobs(request):
    if request.method == "POST":
        if request.user.role != "employer":
            return err("Only employers can post jobs.", 403)
        s = JobSerializer(data=request.data)
        s.is_valid(raise_exception=True)
        s.save(employer=request.user)
        return Response(s.data, 201)
    qs, p = Job.objects.filter(status="open").order_by("-created"), request.query_params
    if p.get("q"):
        qs = qs.filter(Q(title__icontains=p["q"]) | Q(description__icontains=p["q"]) | Q(skills__icontains=p["q"]))
    if p.get("category"):
        qs = qs.filter(category__iexact=p["category"])
    if p.get("language"):
        qs = qs.filter(language__iexact=p["language"])
    if p.get("max_budget"):
        qs = qs.filter(budget__lte=int(p["max_budget"]))
    return Response(JobSerializer(qs, many=True).data)

@api_view(["GET"])
@permission_classes([AllowAny])
def job_detail(request, pk):
    try:
        return Response(JobSerializer(Job.objects.get(pk=pk)).data)
    except Job.DoesNotExist:
        return err("Job not found.", 404)

@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def proposals(request, pk):
    try:
        job = Job.objects.get(pk=pk)
    except Job.DoesNotExist:
        return err("Job not found.", 404)
    if request.method == "GET":
        if job.employer != request.user:
            return err("Only the employer can see proposals.", 403)
        return Response(ProposalSerializer(job.proposals.all(), many=True).data)
    if request.user.role != "freelancer" or job.status != "open":
        return err("Only freelancers can apply to open jobs.", 403)
    s = ProposalSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    if Proposal.objects.filter(job=job, freelancer=request.user).exists():
        return err("You already applied to this job.")
    s.save(job=job, freelancer=request.user)
    return Response(s.data, 201)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def hire(request, pk):
    try:
        prop = Proposal.objects.select_related("job").get(pk=pk)
    except Proposal.DoesNotExist:
        return err("Proposal not found.", 404)
    job = prop.job
    if job.employer != request.user or job.status != "open":
        return err("Only the employer of an open job can hire.", 403)
    contract = Contract.objects.create(job=job, freelancer=prop.freelancer, employer=request.user, amount=prop.price)
    prop.status = "accepted"; prop.save()
    job.proposals.exclude(pk=prop.pk).update(status="rejected")
    job.status = "in_progress"; job.save()
    return Response(ContractSerializer(contract).data, 201)

# ---------- contracts + escrow ----------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def contracts(request):
    qs = Contract.objects.filter(Q(employer=request.user) | Q(freelancer=request.user)).order_by("-created")
    return Response(ContractSerializer(qs, many=True).data)

# action: (who may do it, stage required, next stage)
ESCROW = {
    "deposit": ("employer", "hired", "funded"),
    "start": ("freelancer", "funded", "working"),
    "deliver": ("freelancer", "working", "delivered"),
    "approve": ("employer", "delivered", "paid"),
}

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def escrow_action(request, pk, action):
    try:
        c = Contract.objects.get(pk=pk)
    except Contract.DoesNotExist:
        return err("Contract not found.", 404)
    if request.user not in (c.employer, c.freelancer):
        return err("You are not part of this contract.", 403)
    if action == "dispute":
        if c.stage not in ("funded", "working", "delivered"):
            return err("A dispute needs money in escrow.")
        c.stage = "disputed"; c.save()
        return Response(ContractSerializer(c).data)
    if action not in ESCROW:
        return err("Unknown action.", 404)
    if action == "deposit" and rzp_keys()[0]:
        return err("Use the payment checkout to deposit.")
    who, need, nxt = ESCROW[action]
    if request.user.role != who or request.user not in (c.employer, c.freelancer):
        return err(f"Only the {who} can do this.", 403)
    if c.stage != need:
        return err(f"Cannot {action} when stage is '{c.stage}'. Expected '{need}'.")
    if action == "deposit":   # test mode: swap for Razorpay order + signature check later
        Transaction.objects.create(contract=c, kind="deposit", amount=c.amount, gateway_ref="TEST-" + uuid.uuid4().hex[:10])
    if action == "approve":
        Transaction.objects.create(contract=c, kind="release", amount=c.amount, gateway_ref="TEST-" + uuid.uuid4().hex[:10])
        c.job.status = "completed"; c.job.save()
    c.stage = nxt; c.save()
    return Response(ContractSerializer(c).data)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def review(request, pk):
    try:
        c = Contract.objects.get(pk=pk)
    except Contract.DoesNotExist:
        return err("Contract not found.", 404)
    if request.user not in (c.employer, c.freelancer) or c.stage != "paid":
        return err("Reviews unlock after payment is released.", 403)
    s = ReviewSerializer(data=request.data)
    s.is_valid(raise_exception=True)
    if not 1 <= s.validated_data["rating"] <= 5:
        return err("Rating must be 1 to 5.")
    to = c.freelancer if request.user == c.employer else c.employer
    if Review.objects.filter(contract=c, from_user=request.user).exists():
        return err("You already reviewed this contract.")
    s.save(contract=c, from_user=request.user, to_user=to)
    return Response(s.data, 201)

# ---------- people, AI-style recommendations, insights ----------
@api_view(["GET"])
@permission_classes([AllowAny])
def freelancers(request):
    qs = User.objects.filter(role="freelancer")
    q = request.query_params.get("q")
    if q:
        qs = qs.filter(Q(username__icontains=q) | Q(skills__icontains=q) | Q(city__icontains=q))
    return Response(UserSerializer(qs, many=True).data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recommended_jobs(request):
    out = [dict(JobSerializer(j).data, match=m, why=w) for j, m, w in ai.rank_jobs(request.user, list(Job.objects.filter(status="open")))]
    return Response(sorted(out, key=lambda x: -x["match"]))

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def job_matches(request, pk):
    try:
        job = Job.objects.get(pk=pk, employer=request.user)
    except Job.DoesNotExist:
        return err("Job not found.", 404)
    people = list(User.objects.filter(role="freelancer"))
    ratings = {u.id: UserSerializer(u).data["rating"] for u in people}
    out = [dict(UserSerializer(u).data, match=m, why=w) for u, m, w in ai.rank_people(job, people, ratings)]
    return Response(sorted(out, key=lambda x: -x["match"]))

@api_view(["GET"])
@permission_classes([AllowAny])
def insights(request):
    open_ = list(Job.objects.filter(status="open"))
    cats = Job.objects.filter(status="open").values("category").annotate(jobs=Count("id"), avg=Avg("budget")).order_by("-jobs")
    skills, langs = Counter(s for j in open_ for s in j.skill_list()), Counter(j.language for j in open_)
    tip, u = None, request.user
    if u.is_authenticated and u.role == "freelancer":
        gap = [(s, n) for s, n in skills.most_common() if s not in set(u.skill_list())][:2]
        tip = ("In demand right now: " + ", ".join(f"{s} ({n} open job{'s' if n > 1 else ''})" for s, n in gap) + ". Adding them to your profile would unlock more matches.") if gap else "Your skills already cover the most in-demand work. Keep your profile fresh."
    return Response({"total_open": len(open_), "tip": tip,
                     "categories": [{"category": c["category"], "open_jobs": c["jobs"], "avg_budget": round(c["avg"] or 0)} for c in cats],
                     "skills": [{"skill": s, "count": n} for s, n in skills.most_common(10)],
                     "languages": [{"language": l, "count": n} for l, n in langs.most_common()]})

@api_view(["GET"])
@permission_classes([AllowAny])
def price_estimate(request):
    p = request.query_params
    need = {s.strip().lower() for s in p.get("skills", "").split(",") if s.strip()}
    pool = [j for j in Job.objects.all() if j.category.lower() == p.get("category", "").lower()]
    narrow = [j for j in pool if need & set(j.skill_list())]
    level = "skills" if len(narrow) >= 3 else "category"
    band = ai.price_band([j.budget for j in (narrow if level == "skills" else pool)])
    return Response(dict(band, level=level) if band else {"based_on": len(pool), "level": level})

# ---------- Razorpay (test mode) ----------
def rzp_keys():
    return os.environ.get("RAZORPAY_KEY_ID", ""), os.environ.get("RAZORPAY_KEY_SECRET", "")

def _employer_contract(request, pk):
    try:
        c = Contract.objects.get(pk=pk)
    except Contract.DoesNotExist:
        return None
    return c if request.user == c.employer and c.stage == "hired" else None

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def pay_create(request, pk):
    c = _employer_contract(request, pk)
    if not c:
        return err("Only the employer can fund a newly hired contract.", 403)
    kid, sec = rzp_keys()
    if not kid:
        return Response({"mode": "test"})
    body = json.dumps({"amount": c.amount * 100, "currency": "INR", "receipt": f"hindwork-{c.id}"}).encode()
    auth = base64.b64encode(f"{kid}:{sec}".encode()).decode()
    req = urllib.request.Request("https://api.razorpay.com/v1/orders", data=body, headers={"Content-Type": "application/json", "Authorization": "Basic " + auth})
    try:
        order = json.load(urllib.request.urlopen(req, timeout=15))
    except Exception:
        return err("Could not create the Razorpay order. Check your test keys.", 502)
    c.razorpay_order_id = order["id"]; c.save()
    return Response({"mode": "razorpay", "key_id": kid, "order_id": order["id"], "amount": order["amount"]})

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def pay_verify(request, pk):
    c = _employer_contract(request, pk)
    kid, sec = rzp_keys()
    d = request.data
    oid, pid, sig = d.get("razorpay_order_id", ""), d.get("razorpay_payment_id", ""), d.get("razorpay_signature", "")
    if not c or not sec or not c.razorpay_order_id or oid != c.razorpay_order_id:
        return err("Payment does not match this contract.", 400)
    good = hmac.new(sec.encode(), f"{oid}|{pid}".encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(good, sig):
        return err("Payment signature mismatch. Money was not moved to escrow.", 400)
    Transaction.objects.create(contract=c, kind="deposit", amount=c.amount, gateway_ref=pid)
    c.stage = "funded"; c.save()
    return Response(ContractSerializer(c).data)

# ---------- real platform data (no demo content) ----------
@api_view(["GET"])
@permission_classes([AllowAny])
def stats(request):
    paid = Transaction.objects.filter(kind="release").aggregate(s=Sum("amount"))["s"] or 0
    return Response({"freelancers": User.objects.filter(role="freelancer").count(), "employers": User.objects.filter(role="employer").count(),
                     "open_jobs": Job.objects.filter(status="open").count(), "completed_jobs": Job.objects.filter(status="completed").count(), "paid_total": paid})

@api_view(["GET"])
@permission_classes([AllowAny])
def freelancer_detail(request, pk):
    try:
        u = User.objects.get(pk=pk, role="freelancer")
    except User.DoesNotExist:
        return err("Freelancer not found.", 404)
    revs = Review.objects.filter(to_user=u).select_related("from_user").order_by("-id")
    return Response(dict(UserSerializer(u).data, completed=Contract.objects.filter(freelancer=u, stage="paid").count(), review_count=revs.count(),
                         reviews=[{"rating": r.rating, "comment": r.comment, "from": r.from_user.username} for r in revs[:20]]))
