from web3 import Web3
import os


def convert_uuid(uuid):
    """
        Takes a UUID object, and returns a bytes32 hash of the UUID string, 
        with dashes removed.
    """
    return Web3.keccak(text=str(uuid).replace('-', ''))


def convert_timestamp(datetime_obj):
    """Takes a Python datetime object, and returns an integer UNIX timestamp"""
    return int(datetime_obj.timestamp())


def convert_money(amount):
    """Takes a Python Decimal  object, and returns an integer amount in pence"""
    return int(round(float(amount), 2) * 100)


def generate_eth_address():
    """Creates a cryptographically secure random Ethereum address"""
    # Use the OS's random number generator to create 20-byte address
    address = '0x' + os.urandom(20).hex()
    # Add mix of lower and uppercase letters to make a checksum
    return Web3.to_checksum_address(address)


def get_bytes32(python_string):
    """
        Convert a Python string into the Solidity 'bytes32' type (i.e.
        into a 32-byte bytes object)
    """
    # CREDIT: adapted from GitHub Copilot suggestion
    return python_string.encode('utf-8').ljust(32, b'\0').hex()
