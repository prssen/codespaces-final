import { ethers } from "ethers";
import Web3 from 'web3';
import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';

// import { NonceManager } from "@ethersproject/experimental";
// import { getAddress } from "./blockchain_utils";
import { getAddress } from "@/lib/utils/blockchain_utils";
// import charityAddresses from "../../backend/accounting/blockchain_service/charity_addresses.txt";
// export { default as charityAddresses } from "../../../../../backend/accounting/blockchain_service/charity_addresses.txt";
export { default as charityAddresses } from "../../../../backend/accounting/blockchain_service/charity_addresses.txt";
// export { default as Charity_abi } from "../../../../../final-blockchain/Ethereum/brownie/build/contracts/Charity.json";
export { default as Charity_abi } from "../../../../blockchain/build/contracts/Charity.json";
// export { default as Project_abi } from "../../../../../final-blockchain/Ethereum/brownie/build/contracts/Projects.json";
export { default as Project_abi } from "../../../../blockchain/build/contracts/Projects.json";
// export { default as SourceDoc_abi } from "../../../../../final-blockchain/Ethereum/brownie/build/contracts/SourceDocuments.json";
export { default as SourceDoc_abi } from "../../../../blockchain/build/contracts/SourceDocuments.json";
export { paymentMethods, expenseTypes } from '@/lib/utils/constants';
import { getLocationName } from "@/lib/api/geolocation";

dayjs.extend(LocalizedFormat);
const web3 = new Web3();

// console.log('Charity_abi is: ', Charity_abi);

/**
 * Conects to blockchain.
 * 
 * @returns {{ errorMessage, provider, signer }} - 
 *      error message, 
 *      ethers.js Provider to establish connection, 
 *      Signer to sign state-changing blockchain transactions
 */
// export const connectWalletHandler = async (accountAddress) => {
export const connectWalletHandler = async () => {
    let errorMessage, provider, signer;
    if (window.ethereum == null) {
        // setErrorMessage("Plsease install Metamask!");
        errorMessage = 'Please install Metamask!';
    }
    else {
        provider = new ethers.BrowserProvider(window.ethereum);
        // setProvider(tempProvider);
        // To avoiding waiting for a state refresh, we use signer from
        // the local variable
        // const tempSigner = await provider.getSigner();

        // signer = await provider.getSigner(accountAddress);
        signer = await provider.getSigner();


        // signer = new NonceManager(tempSigner);
        // setSigner(tempSigner);
        // setConnButtonText('Wallet Connected!');
    }
    return { errorMessage, provider, signer };
}

/**
 * Confirm transaction amounts are correct.
 * 
 * @param {*} signer - ethers.js Signer instance used to connect to blockchain
 * @param {*} transaction_uuid - raw UUID (not hashed) for transaction in database
 * @param {*} charity_uuid - database UUID for charity of caller
 * 
 * @returns {tx} - ethers.js TransactionReceipt object
 */
// export const confirmTransaction = async (signer, transaction_uuid, charity_uuid) => {
export const confirmTransaction = async (signer, transaction) => {
    try {
        const response = await fetch(charityAddresses);
        const data = await response.text();
        // const charityAddress = getAddress(data, charity_uuid);
        const charityAddress = getAddress(data, transaction.receiver_uuid);

        // let contract;
        // if (transaction.message?.to) {
        //     contract = new ethers.Contract(charityAddress, Charity_abi['abi'], signer).connect(transaction.message.to);
        //     console.log(`Charity contract address: ${charityAddress}, charity account: ${transaction.message.to}`);
        // } 
        // else {
            const contract = new ethers.Contract(charityAddress, Charity_abi['abi'], signer);
            // contract = new ethers.Contract(charityAddress, Charity_abi['abi'], signer);
        // }  
        
        // const expenseUUID = ethers.keccak256(ethers.toUtf8Bytes(transaction_uuid));
        const expenseUUID = ethers.keccak256(ethers.toUtf8Bytes(transaction.message.expenseUUID));
        console.log('Confirm transaction expense UUID', expenseUUID);
        const tx = await contract.confirmExpense(expenseUUID);
        console.log('Confirm transaction response:', tx);
        // TODO: untested code - check it works
        const result = await tx.wait();
        console.log('TransactionReceipt object from confirmExpense:', result);
        console.log('Event log for confirmExpense:', result.logs);
        // Check ExpenseConfirmed event is in transaction logs, indicating successful confirmation
        const expenseConfirmed = result.logs[0].args.expenseUUID === expenseUUID;
        return tx;
        
    } catch (error) {
        console.error('Error confirming transaction: ', error);
    }
    
}

/**
 * Get proportion of charity donation spent.
 * 
 * @param {*} signer 
 * @param {*} donation 
 * @returns 
 */
export const getSpend = async (signer, donation) => {
    try {
        // Get contract addresses
        const response = await fetch(charityAddresses);
        const data = await response.text();
        const charityAddress = getAddress(data, donation.parent_charity);

        console.log(data);
        console.log(signer);

        // Call smart contract 
        const projectUUID = donation.project_uuid.replace(/-/g, '');
        const bytes32ProjectUUID = ethers.keccak256(ethers.toUtf8Bytes(projectUUID));
        console.log(bytes32ProjectUUID);
        const contract = new ethers.Contract(charityAddress, Charity_abi['abi'], signer);
        console.log('Contract instantiated');

        const result = await contract.getSpend(bytes32ProjectUUID, charityAddress);
        let spendProportion = Number(result[1]) / Number(result[0]);

        if (Number(result[1]) == 0) {
            spendProportion = 0;
        }
        console.log('Transaction: ', result);

        return { result, spendProportion };
    } catch (error) {
        console.error('Error reading file:', error);
    }
}

/**
 * Get breakdown of expenses.
 * 
 * @param {*} signer 
 * @param {*} donation 
 * @returns 
 */
const getExpenseBreakdown = async (signer, donation) => {

    const expenseTypes = ['Salaries', 'Rent', 'Office', 'Donations', 'Program', 'Fundraising', 'Technology', 'Services', 'Insurance', 'Training'];
    const response = await fetch(charityAddresses);
    const data = await response.text();
    const charityAddress = getAddress(data, donation.parent_charity);

    const projectUUID = donation.project_uuid.replace(/-/g, '');
    const bytes32ProjectUUID = ethers.keccak256(ethers.toUtf8Bytes(projectUUID));
    console.log('bytes 32 projectUUID: ', bytes32ProjectUUID);
    const contract = new ethers.Contract(charityAddress, Charity_abi['abi'], signer);
    console.log('Expense breakdown contract:', contract);
    const staticResult = await contract.getExpenseBreakdown.staticCall(bytes32ProjectUUID, charityAddress);
    console.log('static call result: ', staticResult);

    // Get amounts for each expense type in the form 'expenseTypeIndex': 'amount',
    // use 'expenseTypes' array to convert index to name, and store name + amount
    // in returnValue
    let chartData = [];
    for (const [index, resultExpenseType] of staticResult.entries()) {
        chartData.push({
            id: index,
           // value: formatCurrency(parseFloat(resultExpenseType[1]) / 100),
            value: parseFloat(resultExpenseType[1]) / 100,
            label: expenseTypes[parseInt(resultExpenseType[0])]
            //                 { id: 0, value: 20, label: "wages" },
        });
        // returnValue[expenseTypes[parseInt(resultExpenseType[0])]] = formatCurrency(parseFloat(resultExpenseType[1]) / 100)
    };
    // Remove empty values
    chartData = chartData.filter(e => parseFloat(e.value) !== 0);

    // Return data in format required by donation tracker pie chart
    const returnValue = [{
        data: chartData,
        type: 'pie', // TODO: remove if not using <ResponsiveContainer>
        cx: "25%",
        innerRadius: 35,
        outerRadius: 50,
    }];
    return returnValue;
}

const getProjectExpenses = async (signer, donation) => {
    const charityAddress = getAddress(charityAddresses, donation.parent_charity);
    const contract = new ethers.Contract(charityAddress, Project_abi['abi'], signer);
}

/**
 * Get project activities.
 */
const getActivities = async (signer, donation) => {
    const web3 = new Web3();
    const response = await fetch(charityAddresses);
    const data = await response.text();

    const charityAddress = getAddress(data, donation.parent_charity);
    const contract = new ethers.Contract(charityAddress, Project_abi['abi'], signer);

    const projectUUID = donation.project_uuid.replace(/-/g, '');
    const bytes32ProjectUUID = ethers.keccak256(ethers.toUtf8Bytes(projectUUID));
    const activityResponse = await contract.getActivities(bytes32ProjectUUID);
    console.log('Activities retrieved:', activityResponse);
    const activitiesPromises = await activityResponse[0].map(async (activity, index) => ({
        // TODO: if redundant, delete
        projectUUID: activity[0],
        date: dayjs.unix(Number(activity[1])).fromNow(),
        title: web3.utils.toAscii(activity[2]),
        notes: web3.utils.toAscii(activity[3]),
        // As activities and indicators array should be same length,
        // using the index of the activities array should allow us to find the matching indicator
        indicator: activityResponse[1][index].name,
        location: { 
            name: hexToAscii(activity[5][0]) || await getLocationName({ lat: Number(activity[5][1]) / 1e6, lon: Number(activity[5][2]) / 1e6}),
            lat: Number(activity[5][1]) / 1e6, 
            lon: Number(activity[5][2]) / 1e6,
        },
        indicatorAmount: Number(activity[6]),
        isConfirmed: activity[7],
        // activity[8] is the 'isActivity' flag - skip
        imageLinks: activity[9] // TODO: these will be IPFS hashes; resolve into links
    }));
    const activities = await Promise.all(activitiesPromises);
    console.log('Transformed activities: ', activities);

    setTimelineData(activities?.map(e => ({
        ...e,
        subtitle: e.date,
        description: e.notes,
        image: e.imageLinks?.length > 0 && e.imageLinks?.[0] 
    })));
    return activityResponse;

    // // TODO: change structure to fit the ActivityTimeline component props
    // const formattedActivities = activities.map(activity => ({
    //     timestamp: ethers.BigNumber.from(activity), // for numbers
    //     addressValue: ethers.utils.getAddress(ethers.utils.hexlify(activity)), // for addresses
    //     stringValue: ethers.utils.parseBytes32String(activity), // for strings
    //     notes: ethers.utils.toUtf8String(activity) // for bytes values
    // }))
}

export const getProjectTransactions = async (signer, donation) => {
    // Data format: [[payee, paymentMethod, expenseType, total, isConfirmed, isDisputed, isExpense], transactionUUID, timestamp, narration]
    // e.g. [[0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c,0,0,100,false,false,true],0x000000000000000000000000000000003879cdb0e5864b188f570ccea6972de1,[[1622524800,Expense for office supplies"]]]
    const charityAddress = getAddress(charityAddresses, donation.parent_charity);
    const contract = new ethers.Contract(charityAddress, Project_abi['abi'], signer);
    
    const projectUUID = donation.project_uuid.replace(/-/g, '');
    const bytes32ProjectUUID = ethers.keccak256(ethers.toUtf8Bytes(projectUUID));
    const transactions = await contract.getProjectExpenseTransactions.staticCall(bytes32ProjectUUID);

    const response = transactions.map(e => (({
        payee: e[0][0],
        paymentMethod: paymentMethods[e[0][1]],
        expenseType: expenseTypes(e[0][2]),
        total: Number(e[0][3]) / 100,
        isConfirmed: e[0][4],
        timestamp: dayjs.unix(Number(e[2][0][0])).format('LL'),
        details: web3.hexToAscii(e[2][0][1]),
    })));

    return response;

}

