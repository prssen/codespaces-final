import os
import sys
import django
import datetime
from groq import Groq
# import openai
from django.db import transaction
from decimal import Decimal
import random
import csv, uuid

# Set up Django environment
sys.path.append(
    '/Users/senaypetros/Documents/UoL/Final Project/Deliverables/Final_Code/backend')
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

# Set up Groq
client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)

# chat_completion = client.chat.completions.create(
#     messages=[
#         {
#             "role": "user",
#             "content": "Explain the importance of fast language models",
#         }
#     ],
#     model="llama3-8b-8192",
# )

# print(chat_completion.choices[0].message.content)

# Import your models
from accounting.models import ProjectAppeal, Project, Transaction, Donation

# # Set up OpenAI API key
# openai.api_key = 'your-openai-api-key'

def generate_texts(prompts):
    """Generate texts using GPT-3.5-turbo for a list of prompts"""
    messages = [{"role": "system", "content": "You are a helpful assistant that generates realistic test data."}]
    for prompt in prompts:
        messages.append({"role": "user", "content": prompt})
    
    # response = openai.ChatCompletion.create(
    #     model="gpt-3.5-turbo",
    #     messages=messages
    # )

    response = client.chat.completions.create(
        messages=messages,
        model="llama3-8b-8192"
    )
    print('Response: ', response)
    
    return [choice.message['content'].strip() for choice in response.choices]

def generate_money():
    """Generate a random amount of money between 1000 and 1000000"""
    return Decimal(random.uniform(1000, 1000000)).quantize(Decimal('0.01'))

def generate_date(start_date=datetime.date(2020, 1, 1), end_date=datetime.date(2025, 12, 31)):
    """Generate a random date between start_date and end_date"""
    time_between_dates = end_date - start_date
    days_between_dates = time_between_dates.days
    random_number_of_days = random.randrange(days_between_dates)
    return start_date + datetime.timedelta(days=random_number_of_days)


def generate_and_save_project_data(num_instances=100, filename='project_data.csv'):
    prompt = f"Generate {num_instances} unique and realistic names for charitable projects. Provide them as a comma-separated list."
    project_names = generate_texts(prompt)[0].split(', ')
    
    with open(filename, 'w', newline='') as csvfile:
        fieldnames = ['uuid', 'name', 'start_date', 'end_date', 'target_donations']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        for name in project_names:
            start_date = generate_date()
            end_date = generate_date(start_date=start_date)
            
            writer.writerow({
                'uuid': uuid.uuid4(),
                'name': name,
                'start_date': start_date,
                'end_date': end_date,
                'target_donations': generate_money()
            })
    
    print(f"Data generated and saved to {filename}")


# @transaction.atomic
# def generate_test_data(num_instances=100):
#     # Generate names and descriptions in bulk
#     appeal_prompts = [f"Generate a name for charitable project appeal {i+1}." for i in range(num_instances)]
#     project_prompts = [f"Generate a name for project {i+1}." for i in range(num_instances)]
#     appeal_names = generate_texts(appeal_prompts)
#     project_names = generate_texts(project_prompts)

#     # Create ProjectAppeals
#     appeals = []
#     for i in range(num_instances):
#         appeal = ProjectAppeal.objects.create(
#             name=appeal_names[i],
#             target_donations=generate_decimal()
#         )
#         appeals.append(appeal)
#         print(f"Created ProjectAppeal: {appeal.name}")

#     # Create Projects
#     projects = []
#     for i in range(num_instances):
#         project = Project.objects.create(
#             name=project_names[i],
#             project_appeal=random.choice(appeals)
#         )
#         projects.append(project)
#         print(f"  Created Project: {project.name}")

#     # Create Transactions
#     transactions = []
#     for i in range(num_instances):
#         transaction = Transaction.objects.create(
#             amount=generate_decimal(),
#             project=random.choice(projects)
#         )
#         transactions.append(transaction)
#         print(f"    Created Transaction: {transaction.id}")

#     # Create Donations
#     for i in range(num_instances):
#         donation = Donation.objects.create(
#             amount=generate_decimal(),
#             transaction=random.choice(transactions)
#         )
#         print(f"      Created Donation: {donation.id}")

if __name__ == "__main__":
    generate_and_save_project_data()
    print("Test data generation complete.")
