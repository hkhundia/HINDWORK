# KaamSetu backend (Django + DRF)
```
python -m venv venv && venv\Scripts\activate      # Windows
pip install -r requirements.txt
python manage.py makemigrations api && python manage.py migrate
python manage.py seed
python manage.py runserver     # http://127.0.0.1:8000/api/
```
Auth: `Authorization: Token <token>` (from /api/auth/register/ or /api/auth/login/).

| Method | Endpoint | Who |
|---|---|---|
| POST | /api/auth/register/, /api/auth/login/ | anyone |
| GET | /api/me/ | logged in |
| GET/POST | /api/jobs/ (?q= &category= &language= &max_budget=) | anyone / employer |
| GET | /api/jobs/{id}/ | anyone |
| GET/POST | /api/jobs/{id}/proposals/ | employer / freelancer |
| GET | /api/jobs/{id}/matches/ | employer (best freelancers) |
| POST | /api/proposals/{id}/hire/ | employer |
| GET | /api/contracts/ | party |
| POST | /api/contracts/{id}/deposit, start, deliver, approve, dispute | see escrow below |
| POST | /api/contracts/{id}/review/ | party, after paid |
| GET | /api/freelancers/ (?q=), /api/recommendations/jobs/, /api/insights/ | |

Escrow stages: hired -> (employer deposit) funded -> (freelancer start) working -> (freelancer deliver) delivered -> (employer approve) paid. Dispute freezes funded/working/delivered. Payments are TEST mode; replace the `deposit` and `approve` blocks in views.py with Razorpay.
Admin panel: create superuser with `python manage.py createsuperuser`, open /admin/.
