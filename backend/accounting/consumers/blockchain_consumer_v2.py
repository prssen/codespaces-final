from accounting.blockchain_provider import brownie_blockchains

def handle_new_expense(event):
    print('New expense created:', event)

while True:
    charity_contract = brownie_blockchains.contracts.Charity[-1]
    
    charity_contract.events.subscribe(
        'NewExpense', handle_new_expense, delay=2
    )
