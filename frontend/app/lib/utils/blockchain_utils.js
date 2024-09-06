import { ethers } from 'ethers';

export const getAddress = (text, name) => {

    return text
        .split('\n')
        .filter(e => e.includes(name))
        .map(line => line.split(':')[1].trim())[0];
}

export const convertUUID = (uuid) => {
    const trimmedUUID = uuid.replace(/-/g, '');
    return ethers.keccak256(ethers.toUtf8Bytes(trimmedUUID));
}