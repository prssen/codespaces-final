from django.test import TestCase

# Create your tests here.

# TODO: test that debits and credits balance (add up to 0)

{
    // "supplier": "1f113307-24c3-4ebf-882f-a4340d15826c",
    "supplier": models.Supplier.objects.first(),
    "parent_charity": "a44d2df6-ce2b-4ac9-9b5f-e14a0288dcfc",
    "payment_type": 0,
    "expense_type": "materials",
    "line_items": [
        {
            "project": "a44d2df6-ce2b-4ac9-9b5f-e14a0288dcfc",
            "timestamp": "2019-01-01",
            "dr_account": "Bill expenses",
            "cr_account": "Cash bank",
            "amount": 1000,
            "description": "Test"
        }
    ]
}

{
    'name': 'Olson Ltd',
    'sector': 'Region.',
    'email': 'hello@gmail.com',
    'legal_structure': 'OTH',
    'charity_commission_number': '12345678',
    'slogan': 'Up cell company Mr improve.',
    'mission': 'Performance stop Congress meeting fly society building. Begin maintain far skill half process sort.\nPositive value talk believe. Western level all over officer window appear.',
    'address': { 
        'address1': 'Civil specific.',
        'address2': 'Time why.',
        'address3': 'Many explain.',
        'postal_code': '95471',
        'district': { 'name': 'hello'},
        'city': { 'name' : 'world'},
        'region': None,
        'country': 'CL'
    }
}