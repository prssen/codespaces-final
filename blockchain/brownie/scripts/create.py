from . import deploy
from brownie import accounts, config, network, Projects
from utils import helpers

def create_project():
    deploy.main()
    

def main():
    print('Testing')
