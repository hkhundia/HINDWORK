from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import *
admin.site.register(User, UserAdmin)
for m in (Job, Proposal, Contract, Transaction, Review):
    admin.site.register(m)
