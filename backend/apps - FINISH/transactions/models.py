from django.db import models
from django.core.exceptions import ValidationError

# A group of accounts set aside for a specific purpose (e.g. 'Youth Club fund', 'Africa Projects Fund')
class Fund(models.Model):
    fund_name = models.CharField(max_length=200)

# TODO: automatically create a balancing equity account for each fund, if any accounts for the fund are > 0 (not empty)


class AccountType(models.Model):
    ACCOUNT_TYPES = (
        ('AST', 'Asset'),
        ('LIA', 'Liability'),
        ('INC', 'Income'),
        ('EXP', 'Expense'),
        ('EQU', 'Equity')
    )
    name = models.CharField(max_length=3, choices=ACCOUNT_TYPES)
    code = models.IntegerField(unique=True)

    # Check there is only 1 account for Asset, 1 for Liability etc            
    def clean(self, *args, **kwargs):
        if AccountType.objects.filter(name=self.name).count() > 1:
            raise ValidationError(f'No more than one %(name) class account allowed', params={name: self.name})
        super(AccountType, self).clean(*args, **kwargs)                     


# TODO: consider using django-mptt to speed up tree traversals
# https://django-mptt.readthedocs.io/en/latest/tutorial.html
class Account(models.Model):
    account_name = models.CharField(max_length=200)
    # Store whether account is a debit or credit account (e.g. Expenses are credit, assets are debit)
    # TODO: inherit this value from parent
    normal = models.IntegerField(choices=((1, 'DEBIT'), (-1, 'CREDIT')), default=1)
    # TODO: enforce that the code is within range of account codes of parent (e.g. '100' -> '100.1' or '105' up to next one in group)
    # or otherwise create hierarchical coding scheme (https://letsledger.com/blog/accounting-projects/the-accounting-code/)
    code = models.IntegerField(unique=True)
    ultimate_parent = models.ForeignKey(AccountType, on_delete=models.CASCADE, related_name='primary_accounts', null=True, blank=True)
    parent_account = models.ForeignKey('self', on_delete=models.CASCADE, related_name='children', null=True, blank=True)
    # TODO: create a 'default VAT rate' for an accoutn, which auto-fills the 'VAT rate' for a transaction involving this account
    # Sources: https://central.xero.com/s/article/Components-of-an-account-in-your-chart-of-accounts and https://www.accountsportal.com/docs/chart-of-accounts/215545763

    # Link to the account in the Standard Chart of Accounts for the country the company is in
    standard_account = models.ForeignKey('StandardAccount', on_delete=models.CASCADE, related_name='user_accounts', null=True, blank=True)
    fund = models.ForeignKey(Fund, on_delete=models.CASCADE, related_name='accounts', null=True, blank=True)
    # To ensure Accounts either have an ultimate_parent (if they are at the top of the hierarchy)
    # or another account as parent_account, but not both
    def clean(self):
        if (self.ultimate_parent and self.parent_account) or (not(self.ultimate_parent) and not(self.parent_account)): 
            raise ValidationError({'ultimate_parent': 'Account must have either a parent_account or an ultimate_parent, but not both.'})

    # TODO: make this a mixin to avoid repeated code elsewhere
    def save(self, *args, **kwargs):
        self.full_clean()
        return super(Account, self).save(*args, **kwargs)


# Official account code from the relevant national standard chart of accounts 
# (used to produce standards-compliant financial statements)
class StandardAccount(Account):
    # TODO: create an enum of standard CoAs (e.g. GAAP, IFRS, industry-specific, non-prfit, by country) and field to specify which one
    # account belongs to
    # TODO: duplicate properties of Account, and remove 'standard_account' ad 'fund'
    '''Otherwise identical to the regular Chart of Accounts represented by "Account"'''

# TODO: choose fields generic enough for any countries' bank account details
# bank account details for the charity itself, for bank deposits/other bank transactions
class BankAccount(models.Model):
    '''Bank account details - not a double-entry account'''
    ACCOUNT_TYPES = (
        (0, 'Savings'),
        (1, 'Current'),
        (2, 'Deposits'),
        (3, 'Money market')
    )
    account_type = models.IntegerField(choices=ACCOUNT_TYPES, default=1)
    double_entry_account = models.OneToOneField(Account, related_name='bank_details', on_delete=models.DO_NOTHING)
    owner = models.ForeignKey(Charity, related_name='accounts', on_delete=models.CASCADE)
    account_number = models.CharField(max_length=35) # Per ISO 7812 - https://open-banking.pass-consulting.com/json_AccountReference.html
    sort_code = models.CharField(max_length=6) # For 
    bank_name = models.CharField(max_length=200, blank=True, null=True)
    routing_number = models.CharField(max_length=9, validators=[RegexValidator(r'^\d+$')]) # 9-digit numeric string - ABA routing number for accounts with US banks


class SourceDocument(models.Model):
    date = models.DateTimeField(auto_now_add=True)


class SourceDocumentAttachments(models.Model):
    source_document = models.ForeignKey(SourceDocument, related_name='attachments', on_delete=models.CASCADE)
    file = models.FileField(upload_to='uploads/', max_length=254, null=True, blank=True)
    # Flag to indicate whether attachment will be shared to donors on donation tracker
    # as evidence of the transaction
    is_public = models.BooleanField(default=False)


class SourceDocumentComments(models.Model):
    source_document = models.ForeignKey(SourceDocumentAttachments, related_name='comments', on_delete=models.CASCADE)
    date = models.DateTimeField(auto_now_add=True)
    text = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')


class Transaction(models.Model):
    timestamp = models.DateTimeField(default=timezone.now)
    # Optional, as journal entries may not be associated with a source document
    source_doc = models.ForeignKey(SourceDocument, on_delete=models.DO_NOTHING, related_name='transaction', null=True, blank=True)
    # Look up relevant VAT (sales tax) rate for transaction
    # TODO: enable default (in commented out code)
    # VAT_rate = models.ForeignKey('VATRates', on_delete=models.SET_DEFAULT, null=True, blank=True, default=default_vat_rate)
    VAT_rate = models.ForeignKey('VATRates', on_delete=models.SET_NULL, null=True, blank=True)

    # # TODO: this doesn't work because you can't call reverse accessors until you've saved the object
    # # (which is what I'm doing here). So move this validation logic to the serialiser instead
    # # --- Check that debits and credits add up ----
    # def clean(self):
    #     # Multiply transaction amounts by direction, and add up
    #     # transaction_legs = self.entries.all()
        
    #     # if transaction_legs:
    #     if self.filter(transactiondetail_isnull=False):
    #         transaction_legs = self.entries.all()
    #         total = sum(i.amount * i.direction for i in transaction_legs)

    #         # Total should equal 0
    #         if total != 0:
    #             raise ValidationError("Debits and credits must balance.")

    # TODO: make this a mixin to avoid repeated code elsewhere
    def save(self, *args, **kwargs):
        self.full_clean()
        return super(Transaction, self).save(*args, **kwargs)

class TransactionDetail(models.Model):
    # Multiply amount by this number, to determine if amount is to be debited or 
    # credited to an account (inspired by https://blog.journalize.io/posts/an-elegant-db-schema-for-double-entry-accounting/)
    class Direction(models.IntegerChoices):
        DEBIT = 1
        CREDIT = -1
    
    transaction = models.ForeignKey(Transaction, related_name='entries', on_delete=models.CASCADE)
    # TODO: check if DECIMAL(19,4) is appropriate for all currencies (e.g. ETH) - https://stackoverflow.com/a/224866/405682
    account = models.ForeignKey(Account, on_delete=models.PROTECT)
    amount = MoneyField(max_digits=19, decimal_places=4, default_currency='GBP')
    narration = models.TextField(blank=True, null=True)
    direction = models.IntegerField(choices=Direction.choices)

