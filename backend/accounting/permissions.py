from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import BasePermission
# from accounting.constants import DONATION_TRACKER_OBJECTS


# class HasAccess(BasePermission):
#     """
#         Custom permission to check user belongs to the correct charity and class of user (
#         donation tracker or accounting system user) to access the page
#     """

#     def has_permission(self, request, view):
#         object = view.get_object()

#         # Check if object's charity name is in the list of charities user is associated with
#         charity_names = [
#             i.charity.name for i in request.user.profile.charities.all()]
#         correct_charity = object.charity_name in charity_names

#         # Check if user has the correct account type to access the view
#         # 0 is the donation tracker user type (see models.py)
#         if request.user.profile.userType == 0:
#             correct_account_type = type(object) in DONATION_TRACKER_OBJECTS

#         return correct_charity and correct_account_type


class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
        Disable CSRF checks to enable front-end to connect with API
        during development.
        Credit: https://stackoverflow.com/a/30875830
    """

    def enforce_csrf(self, request):
        return
