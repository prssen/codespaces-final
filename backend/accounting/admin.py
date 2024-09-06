from django.contrib import admin

from .models import (Charity, Address,
                     Country, Region,
                     City, District,
                     Account, StandardAccount, AccountType,
                     Donor, Expense, Transaction, TransactionDetail,
                     VATRates, SourceDocument, SourceDocumentAttachments,
                     Fund, Supplier, Donation, Profile, ProfileCharity,
                     Project, ProjectAppeal, ProjectUpdatesMedia, ProjectAppealUpdate, 
                     Service, Indicator,
                     BlockchainUser,
                     ProjectGallery, Notification,
                     IndicatorUnit, Activity, ActivityAttachment,
                     Customer, Invoice, InvoiceTerm, InvoiceTemplate, Bill)


@admin.register(Charity)
class CharityAdmin(admin.ModelAdmin):
    readonly_fields = ['uuid']


@admin.register(ProjectAppeal)
class ProjectAppealAdmin(admin.ModelAdmin):
    readonly_fields = ['uuid']


# Register your models here.
admin.site.register(Address)
admin.site.register(Country)
admin.site.register(Region)
admin.site.register(City)
admin.site.register(District)
admin.site.register(AccountType)
admin.site.register(Account)
admin.site.register(StandardAccount)
admin.site.register(Donor)
admin.site.register(Expense)
admin.site.register(Transaction)
admin.site.register(TransactionDetail)
admin.site.register(VATRates)
admin.site.register(SourceDocument)
admin.site.register(SourceDocumentAttachments)
admin.site.register(Fund)
admin.site.register(Supplier)
admin.site.register(Donation)
admin.site.register(Profile)
admin.site.register(ProfileCharity)
admin.site.register(Project)
admin.site.register(ProjectAppealUpdate)
admin.site.register(Service)
admin.site.register(Indicator)
admin.site.register(Activity)
admin.site.register(ActivityAttachment)
admin.site.register(IndicatorUnit)
admin.site.register(ProjectGallery)
admin.site.register(ProjectUpdatesMedia)
admin.site.register(Invoice)
admin.site.register(InvoiceTerm)
admin.site.register(InvoiceTemplate)
admin.site.register(Bill)
admin.site.register(Customer)
admin.site.register(Notification)
admin.site.register(BlockchainUser)
