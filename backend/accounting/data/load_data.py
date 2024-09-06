import csv
import requests
from django.core.files.base import ContentFile
from accounting.models import *
from py_ipfs_cid import compute_cid

def read_csv(file_path):
    data = []
    with open(file_path, 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            data.append(row)
    return data

def image(image_url):
    response = requests.get(image_url)
    # Testing: QmPru8jesvCLbvHYfSwj1RVRcRwfCsbJuXehMTTRL46Q7H
    # filename = subprocess.run(["ipfs", "add", "-n"], )
    # Pass in file as bytes to compute IPFS Content ID (hash address),
    # use as filename
    filename = compute_cid(response.content)
    return ContentFile(response.content, name=filename),

def create_charity(data):
    instances = []
    for row in data:
        instance = Charity(
            name=row['name'],
            field2=row['field2'],
            avatar=image(row['avatarURL'])
            # Add more fields as needed
        )
        instances.append(instance)
    Charity.objects.bulk_create(instances)


def load_data(csv_directory):
    # Iterate through files in directory
    