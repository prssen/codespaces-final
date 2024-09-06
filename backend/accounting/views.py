from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie, csrf_protect
from django.utils.decorators import method_decorator
from django.views.decorators.cache import never_cache
from django.views.decorators.debug import sensitive_post_parameters
from django.http import HttpResponse, HttpResponseRedirect
from . import models
from django.contrib.auth import views


# @csrf_exempt
# def test_login(request, *args, **kwargs):
#     return views.LoginView.as_view(template_name='rest_framework/login.html')(request, *args, **kwargs)


class test_login(views.LoginView):
    # From https://gist.github.com/mvasilkov/c4dcf5300b12886ffb61e64b745cb1b1
    # @method_decorator(sensitive_post_parameters())
    # @method_decorator(csrf_exempt)
    # @method_decorator(never_cache)
    # def dispatch(self, request, *args, **kwargs):
    #     # if self.redirect_authenticated_user and self.request.user.is_authenticated:
    #     if self.redirect_authenticated_user and request.user.is_authenticated:
    #         redirect_to = self.get_success_url()
    #         # if redirect_to == self.request.path:
    #         if redirect_to == request.path:
    #             raise ValueError(
    #                 'Redirection loop for authenticated user detected. Check that '
    #                 'your LOGIN_REDIRECT_URL doesn\'t point to a login page.')
    #         return HttpResponseRedirect(redirect_to)
    #     return super().dispatch(request, *args, **kwargs)

    @method_decorator(sensitive_post_parameters())
    @method_decorator(csrf_exempt)
    @method_decorator(never_cache)
    def dispatch(self, request, *args, **kwargs):
        if self.redirect_authenticated_user and self.request.user.is_authenticated:
            redirect_to = self.get_success_url()
            if redirect_to == self.request.path:
                raise ValueError(
                    "Redirection loop for authenticated user detected. Check that "
                    "your LOGIN_REDIRECT_URL doesn't point to a login page."
                )
            return HttpResponseRedirect(redirect_to)
        return super().dispatch(request, *args, **kwargs)


@csrf_exempt
def csrf_exempt_logout(request, *args, **kwargs):
    return views.LogoutView.as_view()(request, *args, **kwargs)


def csrf_exempt_view(view):
    """
        Wrap the view in a CSRF decorator to avoid CSRF errors during
        development.
    """
    return csrf_exempt(view)


def csrf_cookie_view(view):
    """
        Wrap the view in a CSRF decorator to avoid CSRF errors during
        development.
    """
    # return ensure_csrf_cookie(view)
    return csrf_protect(view)


# Create your views here.


def index(request):

    asset, created = models.AccountType.objects.get_or_create(
        name='AST', code=1000)
    acct1, created = models.Account.objects.get_or_create(
        name='Fixed Assets', code=1001, ultimate_parent=asset)
    trans = models.Transaction()
    trans.save()
    leg = models.TransactionDetail(
        transaction=trans, account=acct1, amount=200.50, direction=1)
    leg.save()

    # for model in models:
    #     print(model)

    return HttpResponse('Testing')
