import subprocess
import sys

def install_requirements(file_path):
    # Read the requirements file
    with open(file_path, 'r') as file:
        requirements = file.readlines()

    # Strip whitespace and filter out empty lines and comments
    requirements = [req.strip() for req in requirements if req.strip() and not req.startswith('#')]

    # Install each requirement
    for requirement in requirements:
        print(f"Installing {requirement}...")
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", requirement])
            print(f"Successfully installed {requirement}")
        except subprocess.CalledProcessError as e:
            print(f"Failed to install {requirement}. Error: {e}")

if __name__ == "__main__":
    requirements_file = "requirements.txt"  # You can change this to accept command-line arguments
    install_requirements(requirements_file)