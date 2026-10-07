"""Dependency-free matching + insights helpers (TF-IDF cosine similarity)."""
import math, re
from collections import Counter

STOP = set("a an the and or for of to in on with is are we i you my our need needs want looking this that it be as at by from".split())

def tok(t):
    return [w for w in re.findall(r"[a-z0-9\+\.#]+", (t or "").lower()) if w not in STOP and len(w) > 1]

def similarity(query, docs):
    """Cosine similarity of `query` against each doc using TF-IDF weights."""
    toks, qt = [tok(d) for d in docs], tok(query)
    df = Counter(w for t in toks + [qt] for w in set(t))
    n = len(docs) + 1
    idf = lambda w: math.log((n + 1) / (df[w] + 1)) + 1
    def vec(t):
        c = Counter(t)
        return {w: c[w] * idf(w) for w in c}
    qv = vec(qt)
    qn = math.sqrt(sum(x * x for x in qv.values())) or 1
    out = []
    for t in toks:
        v = vec(t)
        vn = math.sqrt(sum(x * x for x in v.values())) or 1
        out.append(sum(qv[w] * v.get(w, 0) for w in qv) / (qn * vn))
    return out

def blend(have, need, sim, same_lang, rating=None):
    overlap = len(set(have) & set(need)) / len(set(need)) if need else 0.3
    score = 0.55 * overlap + 0.30 * min(1, sim * 2) + 0.10 * same_lang + 0.05 * ((rating or 4) / 5)
    return max(20, min(99, round(30 + 70 * score)))

def rank_jobs(user, jobs):
    if not jobs:
        return []
    have = user.skill_list()
    sims = similarity(f"{user.skills} {user.bio} {user.skills}", [f"{j.title} {j.description} {j.skills} {j.category}" for j in jobs])
    out = []
    for j, s in zip(jobs, sims):
        shared, lang = sorted(set(have) & set(j.skill_list())), j.language.lower() == user.language.lower()
        why = []
        if shared: why.append("Your skills: " + ", ".join(shared))
        if lang: why.append(f"{j.language} job")
        if not why and s > 0.05: why.append("Similar to your profile")
        out.append((j, blend(have, j.skill_list(), s, lang), "; ".join(why)))
    return out

def rank_people(job, people, ratings=None):
    if not people:
        return []
    ratings = ratings or {}
    need = job.skill_list()
    sims = similarity(f"{job.title} {job.description} {job.skills} {job.category}", [f"{u.skills} {u.bio} {u.skills}" for u in people])
    out = []
    for u, s in zip(people, sims):
        shared, lang = sorted(set(u.skill_list()) & set(need)), u.language.lower() == job.language.lower()
        why = []
        if shared: why.append("Has skills: " + ", ".join(shared))
        if lang: why.append(f"Speaks {u.language}")
        if ratings.get(u.id): why.append(f"Rated {ratings[u.id]}")
        out.append((u, blend(u.skill_list(), need, s, lang, ratings.get(u.id)), "; ".join(why)))
    return out

def price_band(vals):
    v = sorted(vals); n = len(v)
    if n < 3:
        return None
    med = v[n // 2] if n % 2 else (v[n // 2 - 1] + v[n // 2]) // 2
    return {"low": v[int(.25 * (n - 1))], "median": med, "high": v[int(.75 * (n - 1))], "based_on": n}
