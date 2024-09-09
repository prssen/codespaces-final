import csv
import sys
from django.core.files.uploadedfile import SimpleUploadedFile
from accounting import models
from accounting.models import ProjectAppeal, ProjectGallery
from collections import defaultdict
from itertools import chain
import requests
from PIL import Image
from io import BytesIO

def load_project_appeals(data_path):
    project_appeals = {}
    project_galleries = defaultdict(list)

    # TODO: dummy value. Instead:
    # - 1) Create projects in this file, 2) in project appeal, parent_charity=projects[project_id].parent_charity
    charity_uuid = models.Charity.objects.last().uuid
    
    # Load data from CSV file
    with open(data_path) as csv_file:
        csv_reader = csv.reader(csv_file, delimiter=',')
        # Skip header row
        next(csv_reader)
        for row in csv_reader:
            # Populate ProjectAppeal models
            project_appeals[row[0]] = ProjectAppeal(
                uuid=row[0],
                project_id=row[1],
                title=row[2],
                subtitle=row[3],
                date_started=row[4],
                story=row[6],
                is_live=True,
            )
            project_appeals[row[0]] = ProjectAppeal.objects.get(uuid=row[0])

            # Populate ProjectGallery models using created ProjectAppeals
            for index, photo_url in enumerate(row[8].split(', ')):
                # Skip bad URLs
                if len(photo_url) < 5: 
                    continue
                # Get photo from URL
                print(f'Downloading from: ${photo_url}...')
                response = requests.get(photo_url)
                if response.status_code == 200:
                    image_file = SimpleUploadedFile(f'${row[0]}-${index}.jpeg', response.content)
                else:
                    image_file = None
                # Create DB object with downloaded photo - we can't pass an appeal ID yet, 
                # as the project appeal hasn't been saved to the DB - so pass the appeal UUID instead
                # (row[1]) 
                project_galleries[row[0]].append(ProjectGallery(
                    project_id=row[0],
                    photo=image_file,
                    parent_charity=charity_uuid
                ))


    # bulk save created objects - respect FK dependencies!!!
    ProjectAppeal.objects.bulk_create(list(project_appeals.values()))

    # Replace the dummy appeal IDs with the actual object IDs, now they are created
    for gallery_key, gallery in project_galleries.items():
        appeal_uuid = gallery_key
        # appeal_uuid = project_galleries[img_key][0].project_id
        for index, photo in enumerate(gallery):
            project_galleries[gallery_key][index].project_id = project_appeals[appeal_uuid].id

    # Flatten list of list of photo galleries
    flattened_gallery_list = list(chain.from_iterable(project_galleries.values()))
    ProjectGallery.objects.bulk_create(flattened_gallery_list)

    # return projecappeal and project gallery to chain
    # w/ other methods

if __name__ == "__main__":
    load_project_appeals(sys.argv[1])