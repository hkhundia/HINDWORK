from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from . import views as v
urlpatterns = [
    path("auth/register/", v.register), path("auth/login/", obtain_auth_token), path("me/", v.me),
    path("jobs/", v.jobs), path("jobs/<int:pk>/", v.job_detail),
    path("jobs/<int:pk>/proposals/", v.proposals), path("jobs/<int:pk>/matches/", v.job_matches),
    path("proposals/<int:pk>/hire/", v.hire),
    path("contracts/", v.contracts), path("contracts/<int:pk>/review/", v.review),
    path("contracts/<int:pk>/pay/create/", v.pay_create), path("contracts/<int:pk>/pay/verify/", v.pay_verify),
    path("contracts/<int:pk>/<str:action>/", v.escrow_action),
    path("freelancers/", v.freelancers), path("recommendations/jobs/", v.recommended_jobs), path("insights/", v.insights), path("ai/price/", v.price_estimate),
]
