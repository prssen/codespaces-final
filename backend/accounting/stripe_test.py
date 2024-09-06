import stripe
stripe.api_key = "sk_test_51OVH2cHiZwoknnwFONrXCMNwuWpWgSU9nesIGL1fRh8JaeK3Ur2pAhT3WFBQBynJBlYUQOpagKjRYeU7NrJTGHfg00p7arh7Fv"

starter_subscription = stripe.Product.create(
  name="Starter Subscription",
  description="$12/Month subscription",
)

starter_subscription_price = stripe.Price.create(
  unit_amount=1200,
  currency="usd",
  recurring={"interval": "month"},
  product=starter_subscription['id'],
)

# Save these identifiers
print(f"Success! Here is your starter subscription product id: {starter_subscription.id}")
print(f"Success! Here is your starter subscription price id: {starter_subscription_price.id}")