from django.urls import include, path
from rest_framework import routers
from django.contrib.auth import views as django_views

from . import views, api
# from accounting.views import csrf_exempt_view, csrf_cookie_view
from accounting.views import test_login, csrf_exempt_logout

# TODO: nest sub-resources within parent resources (i.e. everything within company/user)
router = routers.DefaultRouter()
router.register(r'users', api.UserViewSet)
router.register(r'countries', api.CountryViewSet)
router.register(r'addresses', api.AddressViewSet)
router.register(r'charities', api.CharityViewSet)
router.register(r'appeal_updates', api.ProjectAppealUpdateViewSet, basename='appeal_updates')
# router.register(r'project_updates_media', api.ProjectUpdateMediaViewSet)
router.register(r'appeals', api.ProjectAppealViewSet)
router.register(r'funds', api.FundViewSet)
router.register(r'accounts', api.AccountViewSet)
router.register(r'bank_accounts', api.BankAccountViewSet)
router.register(r'transactions', api.TransactionViewSet)
router.register(r'donations', api.DonationViewSet)
router.register(r'donors', api.DonorViewSet)
router.register(r'suppliers', api.SupplierViewSet)
router.register(r'expenses', api.ExpenseViewSet)
# router.register(r'profiles', api.ProfileViewSet)
router.register(r'projects', api.ProjectViewSet)
router.register(r'activities', api.ActivityViewSet)
router.register(r'indicators', api.IndicatorViewSet)
router.register(r'services', api.ServiceViewSet)
router.register(r'activity_attachments', api.ActivityAttachmentViewSet, basename='activity_attachments')
router.register(r'invoices', api.InvoiceViewSet)
router.register(r'bills', api.BillViewSet)
router.register(r'notifications', api.NotificationViewSet, basename='notifications')
router.register(r'account_types', api.AccountTypeViewSet)
router.register(r'donation_history', api.DonationHistoryViewSet, basename='donation_history')
router.register(r'profile_charities', api.ProfileCharityViewSet, basename='profile_charities')

# Ideas for new endpoints (from Copilot) - pages listing donors for project etc?
# router.register(r'project_media', api.ProjectMediaViewSet)
# router.register(r'project_categories', api.ProjectCategoryViewSet)
# router.register(r'project_types', api.ProjectTypeViewSet)
# router.register(r'project_statuses', api.ProjectStatusViewSet)
# router.register(r'project_locations', api.ProjectLocationViewSet)
# router.register(r'project_goals', api.ProjectGoalViewSet)
# router.register(r'project_donations', api.ProjectDonationViewSet)
# router.register(r'project_donors', api.ProjectDonorViewSet)
# router.register(r'project_suppliers', api.ProjectSupplierViewSet)

auth_urls = [
    #     path('login/', csrf_cookie_view(django_views.LoginView.as_view(
    #         template_name='rest_framework/login.html')), name='login'),
    #     path('logout/', csrf_exempt_view(django_views.LogoutView.as_view()), name='logout')
    path('login/', test_login.as_view(template_name='rest_framework/login.html'), name='login'),
    path('logout/', csrf_exempt_logout, name='logout')
]

urlpatterns = [
    #     path("", views.index, name="index"),
    #         path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('api-auth/', include((auth_urls, 'rest_framework'),
         namespace='rest_framework')),
    #     path('api-auth/login/', django_views.LoginView.as_view(
    #         template_name='rest_framework/login.html'), name='login'),
    #     path('api-auth/logout/', django_views.LogoutView.as_view(), name='logout'),

    path('accounting_login/', api.AccountingLoginView.as_view(), name="accounting-login"),
    path('tracker_login/', api.TrackerLoginView.as_view(), name="tracker-login"),
    path('accounting_register/', api.AccountingRegisterView.as_view(), name="accounting-register"),
    path('tracker_register/', api.TrackerRegisterView.as_view(), name="tracker-register"),

    path('stripe/', api.stripe_checkout, name="stripe-checkout"),
    path('stripe/success/', api.stripe_success, name="stripe-success"),
    path('stripe/cancel/', api.stripe_cancel, name="stripe-cancel"),

    path('profile/', api.ProfileView.as_view(), name="profile"),

     # # Definining custom lookup fields for the 'appeals' detail view (credit: code from perplexity.ai)
     # path('appeals/<uuid:uuid>', api.ProjectAppealViewSet.as_view({'get': 'retrieve'})),

    path('donor_statistics/', api.DonorAnalyticsView.as_view(),
         name="donor-statistics"),
    path('donation_statistics/', api.DonationAnalyticsView.as_view(),
         name="donation-statistics"),
    path('expense_statistics/', api.ExpenseAnalyticsView.as_view(),
         name="expense-statistics"),
    path('appeal_list_summary/', api.ProjectAppealListView.as_view(),
         name="appeal-list-summary"),
    path('project_summary/<uuid:uuid>',
         api.ProjectSummaryView.as_view(), name="project-summary"),
    path('project_transactions/<uuid:uuid>',
         api.ProjectTransactionView.as_view(), name='project-transactions'),
    path("stripe/webhooks/", api.stripe_webhook_view, name='stripe-webhooks'),
    path("home/", api.CharityHomePageView.as_view(), name='home'),
]

urlpatterns += router.urls
