"use client"
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import React, { useEffect, useState, useRef, useCallback } from "react";

import { styled } from "@mui/material/styles";
import LinearProgress, {
    linearProgressClasses,
} from "@mui/material/LinearProgress";
import { grey } from "@mui/material/colors";
// import { Divider, Button } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";
// import BasicBreadcrumbs from "./Breadcrumb";
import BasicBreadcrumbs from "@/components/Breadcrumb";
// import TrackingUpdates from "./dev_code/TrackingPage/TrackingUpdates";
import TrackingUpdates from "./TrackingUpdate";
// import { useGetDonation } from "./dev_code/Hooks/useApi"
import { useGetDonation } from "@/lib/hooks/useApi";
import { getProjectTransactions } from "@/lib/api/blockchain";
// import mapPhoto from "./assets/impact-map.png";

import { 
    charityAddresses, 
    Project_abi, 
    SourceDoc_abi, 
    Charity_abi } from '@/lib/api/blockchain';

// import contractAddresses from "../../backend/accounting/blockchain_service/contract_addresses.txt";
// import charityAddresses from "../../backend/accounting/blockchain_service/charity_addresses.txt";

import { ethers } from "ethers";
// import currencySymbol from "currency-symbol";

// import Project_abi from "../../final-blockchain/Ethereum/brownie/build/contracts/Projects.json";
// import SourceDoc_abi from "../../final-blockchain/Ethereum/brownie/build/contracts/SourceDocuments.json";
// import Charity_abi from "../../final-blockchain/Ethereum/brownie/build/contracts/Charity.json";

// import SourceDoc_abi from "./dev_code/services/blockchain/SourceDoc_abi.json"

// import Loading from "./dev_code/Components/Loading";
import Loading from "@/components/Loading";
// import { formatCurrency, hexToAscii } from "./utils";
import { formatCurrency, hexToAscii, symb } from "@/lib/utils/utils";
// import { useParams } from 'react-router-dom';
import { useParams } from 'next/navigation';
import _ from 'lodash';
// import { hexToBytes, bytesToUtf8 } from '@ethereumjs/util';
import Web3 from 'web3';
import dayjs from 'dayjs';
import relativeTime from "dayjs/plugin/relativeTime";

// import LeafletMap from "./dev_code/TrackingPage/Map";
// import LeafletMap from "./TrackingMap";
import { LeafletMap } from "@/page"
import { ResponsiveChartContainer } from "@mui/x-charts/ResponsiveChartContainer";
import { responsivePropType } from "@mui/system";

dayjs.extend(relativeTime);

console.log('Blockchain addresses from files', charityAddresses);

// Credit: https://mui.com/material-ui/react-progress/#customization
const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
    height: 10,
    borderRadius: 5,
    [`&.${linearProgressClasses.colorPrimary}`]: {
        backgroundColor:
            theme.palette.grey[theme.palette.mode === "light" ? 200 : 800],
    },
    [`& .${linearProgressClasses.bar}`]: {
        borderRadius: 5,
        backgroundColor: theme.palette.mode === "light" ? "#1a90ff" : "#308fe8",
    },
}));

const TrackingPage = () => {

    let { id } = useParams();
    // const searchParams = useParams();
    // const id = searchParams.get('id');
    console.log('Donation id: ', id);

    let signers = null;

    const [spendProportion, setSpendProportion] = useState({});
    const [timelineData, setTimelineData] = useState([]);
    // const [expenseBreakdown, setExpenseBreakdown] = useState([{
    //     data: [
    //         { id: 0, value: 20, label: "wages" },
    //         { id: 0, value: 40, label: "overheads" },
    //         { id: 0, value: 40, label: "food and drink" },
    //     ],
    //     cx: "25%",
    //     innerRadius: 35,
    //     outerRadius: 50,
    // }]);
    const [expenseBreakdown, setExpenseBreakdown] = useState([]);


    const contractAddress = '0xcCB53c9429d32594F404d01fbe9E65ED1DCda8D9';

    // Blockchain state variables
    const [errorMessage, setErrorMessage] = useState(null);
    // Metamask account
    const [defaultAccount, setDefaultAccount] = useState(null);
    // Buttonn alterates b/w 'Conenct' and ...
    const [connButtonText, setConnButtonText] = useState('Connect Wallet');
    // This will be the getContact value
    const [currentContractVal, setCurrentContractVal] = useState(null);

    const [message, setMessage] = useState(null);

    // Ethers.js state variables
    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [contract, setContract] = useState(null);

    const [projectTransactions, setProjectTransactions] = useState(null);
    
    const connectWalletHandler = async () => {
        if (window.ethereum == null) {
            setErrorMessage("Please install Metamask!");
        }
        else {
            const tempProvider = new ethers.BrowserProvider(window.ethereum);
            setProvider(tempProvider);
            // To avoiding waiting for a state refresh, we use signer from
            // the local variable
            const tempSigner = await tempProvider.getSigner();
            setSigner(tempSigner);
            setConnButtonText('Wallet Connected!');
            return tempSigner;
        }
    }

    const connectHandler = async () => {
        const ganacheProvider = new ethers.JsonRpcProvider();
        const ganacheSigner = await ganacheProvider.getSigner();
        console.log('Ganache signer:', ganacheSigner);
        setProvider(ganacheProvider);
        setSigner(ganacheSigner);
        setConnButtonText('JSON RPC Connection established');
    }

    const getAddress = (text, name) => {

        return text
            .split('\n')
            .filter(e => e.includes(name))
            .map(line => line.split(':')[1]
            .trim())
            .slice(-1)[0]; // When there are multiple matches, this gets the last one
            // [0];
    }

    const getSpend = async (signer, donation) => {
        try {
            // Get contract addresses
            // const response = await fetch(contractAddresses);

            // TODO: delete
            // const response = await fetch(charityAddresses);
            // const data = await response.text();
            // const projectAddress = getAddress(data, 'Projects');
            // const sourceDocAddress = getAddress(data, 'SourceDocuments');
            
            // const charityAddress = getAddress(data, donation.parent_charity);
            const charityAddress = getAddress(charityAddresses, donation.parent_charity);
            // console.log(data);

            // console.log('Project address: ', projectAddress);
            // console.log('Source document address: ', sourceDocAddress);
            console.log('Charity address: ', charityAddress);

            console.log(signer);

            // Call smart contract 
            // const projectUUID = '98685600-c602-4626-995b-74265bcf02b4'.replace(/-/g, '');
            const projectUUID = donation.project_uuid.replace(/-/g, '');
            const bytes32ProjectUUID = ethers.keccak256(ethers.toUtf8Bytes(projectUUID));
            console.log(bytes32ProjectUUID);
            
            // const contract = new ethers.Contract(projectAddress, Project_abi['abi'], signer);
            const contract = new ethers.Contract(charityAddress, Charity_abi['abi'], signer);
            console.log('Contract instantiated');
            // const result = await contract.getSpend(bytes32ProjectUUID, sourceDocAddress);
            const result = await contract.getSpend(bytes32ProjectUUID, charityAddress);
            let spendProportion = Number(result[1]) / Number(result[0]);
            // == not === as 0n (BigInt) does not === 0
            // TODO: add unit test to esure that result[0] (amount donated) is never 0
            if (Number(result[1]) == 0) {
                spendProportion = 0;
            }
            console.log('Transaction: ', result);


            // console.log(await tx.wait())
            // As there is no way to get return values of non-view (state changing) functions from outside the blockchain,
            // we have to simulate transaction execution instead with 'callStatic' to find out what the return
            // value *should* be (see https://ethereum.stackexchange.com/a/109992)
            // const result = await contract.callStatic.getSpend(bytes32ProjectUUID, sourceDocAddress);
            return { result, spendProportion };
            // return { projectAddress, sourceDocAddress }
            // return { data };
            
        }
        catch (error) {
            console.error('Error reading file:', error);
        }
    }

    const getExpenseBreakdown = async (signer, donation) => {
        const expenseTypes = ['Salaries', 'Rent', 'Office', 'Donations', 'Program', 'Fundraising', 'Technology', 'Services', 'Insurance', 'Training'];
        // TODO: create a BlockchainService/Provider class, singeton, duplicated code run on
        // initialisation like in Django app
        // const response = await fetch(contractAddresses);
        
        // const response = await fetch(charityAddresses);
        // const data = await response.text();
        
        // const projectAddress = getAddress(data, 'Projects');
        // const sourceDocAddress = getAddress(data, 'SourceDocuments');
        
        // const charityAddress = getAddress(data, donation.parent_charity);
        const charityAddress = getAddress(charityAddresses, donation.parent_charity);
        
        // TODO: replace with project UUID in query param
        // const projectUUID = '98685600-c602-4626-995b-74265bcf02b4'.replace(/-/g, '');
        const projectUUID = donation.project_uuid.replace(/-/g, '');
        const bytes32ProjectUUID = ethers.keccak256(ethers.toUtf8Bytes(projectUUID));
        console.log('bytes 32 projectUUID: ', bytes32ProjectUUID);

        // const contract = new ethers.Contract(projectAddress, Project_abi['abi'], signer);
        const contract = new ethers.Contract(charityAddress, Charity_abi['abi'], signer);
        console.log('Expense breakdown contract:', contract);
        // Result should be [[ integer, integer ], [ int, int, ] ...]

        /*
        // Incorrect: cannot get return values fromm a transaction (which is what is returned
        // by any non-view function in Solidity)
        const tx = await contract.getExpenseBreakdown(bytes32ProjectUUID, sourceDocAddress);
        console.log('Expense breakdown: ', tx);
        */

        //*/
        // WORKING SOLUTION:
        // const staticResult = await contract.getExpenseBreakdown.staticCall(bytes32ProjectUUID, sourceDocAddress);
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
        const returnValue = [{
            data: chartData,
            type: 'pie', // TODO: remove if not using <ResponsiveContainer>
            cx: "25%",
            innerRadius: 35,
            outerRadius: 50,
        }];
        return returnValue;
        
        // const returnValue = Object.fromEntries(expenseTypes.map((_, i) => [expenseTypes[i], staticResult[i]]));

        //*/

        /*/
        // Incorrect solution: throws error
        debugger;
        const transactionReceipt = await tx.wait();
        const returnValue = await transactionReceipt.getResult();
        //*/
        
        /*
        // Incorrect solution: returns function arguments instead of return value
        const ContractInterface = new ethers.Interface(Project_abi['abi']);
        const result = await ContractInterface.decodeFunctionData('getExpenseBreakdown', tx.data)
        console.log('Decoded function data: ', result);
        
        return result;
        */

        // return { 
        //     expenseType: expenseTypes[Number(result[0])],
        //     amount: Number(result[1])
        // }


    }

    const getLocationName = async ({ index, lat, lon }) => {
        try {
            const nameJson = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
            const nameData = await nameJson.json();
            const name = [
                nameData?.address?.city,
                nameData?.address?.state,
                nameData?.address?.country
            ].filter(v => v).join(', ');
            console.log('return value is:', name || nameData?.display_name);
            return name || nameData?.display_name
        }
        catch (error) {
            console.log(error);
        }
    }

    const getActivities = async (signer, donation) => {
        const web3 = new Web3();
        // const response = await fetch(contractAddresses);
        const response = await fetch(charityAddresses);
        const data = await response.text();
        // const projectAddress = getAddress(data, 'Projects');

        // const charityAddress = getAddress(data, donation.parent_charity);
        const charityAddress = getAddress(charityAddresses, donation.parent_charity);
        // const contract = new ethers.Contract(projectAddress, Project_abi['abi'], signer);
        const contract = new ethers.Contract(charityAddress, Project_abi['abi'], signer);
        // debugger;
        // const projectUUID = '98685600-c602-4626-995b-74265bcf02b4'.replace(/-/g, '');
        const projectUUID = donation.project_uuid.replace(/-/g, '');
        const bytes32ProjectUUID = ethers.keccak256(ethers.toUtf8Bytes(projectUUID));
        const activityResponse = await contract.getActivities(bytes32ProjectUUID);
        console.log('Activities retrieved:', activityResponse);
        const activitiesPromises = await activityResponse[0].map(async (activity, index) => ({
            // TODO: if redundant, delete
            projectUUID: activity[0],
            // Converting timestamp to JS Date object; x1000 as Date() accepts 13-digit timestamps,
            // but standard 10-digit timestamps recorded in blockchain
            // date: new Date(Number(activity[1]) * 1000),
            date: dayjs.unix(Number(activity[1])).fromNow(),
            // title: ethers.toUtf8String(activity[2]),
            // have to use the @ethereumjs utils library, as ethers.js doesn't seem to have an effective way
            // of converting variable-length 'bytes' arrays without null terminators to UTF8 strings 
            // title: bytesToUtf8(hexToBytes(activity[2])),
            title: web3.utils.toAscii(activity[2]),
            // TODO: use web3 methods for the other fieldss
            // notes: ethers.toUtf8String(activity[3]),
            // notes: bytesToUtf8(hexToBytes(activity[3])),
            notes: web3.utils.toAscii(activity[3]),
            // indicator: bytesToUtf8(hexToBytes(activity[4])),
            // indicator: web3.utils.toAscii(activity[4]),
            // As activities and indicators array should be same length,
            // using the index of the activities array should allow us to find the matching indicator
            indicator: activityResponse[1][index].name,
            // indicator: ethers.decodeBytes32String(activity[4]),
            // indicator: activityResponse[1].find(e => e.uuid = ethers.decodeBytes32String(activity[4])[0].name)
            location: { 
                // name: web3.utils.toAscii(activity[5][0]) || await getLocationName({ lat: Number(activity[5][1]), lon: Number(activity[5][2])}),
                name: hexToAscii(activity[5][0]) || await getLocationName({ lat: Number(activity[5][1]) / 1e6, lon: Number(activity[5][2]) / 1e6}),
                // lat: Num+ber(activity[5][1]) + Math.floor(Math.random() * 90), 
                // lon: Number(activity[5][2]) + Math.floor(Math.random() * 30),
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

    const getExpense = async () => {
        const contract = new ethers.Contract(contractAddress, SourceDoc_abi, provider);
        // setMessage(JSON.stringify(contract));
        const expenseData = await contract.expenses('0x000000000000000000000000000000003879cdb0e5864b188f570ccea6972de0');
        console.log(expenseData);
        setMessage(expenseData);
    }

    // const connectWalletHandler = () => {
    //     // User presses button, ths connects to Metammask

    //     if (window.ethereum) {
    //         // REturnns Metammask account and asks user to connect to it
    //         window.ethereum.request({method: ''})
    //             .then(result => {
    //                 // Result will be array of Ethereum account to which user is connected?
                    
    //                 // This takes our connected accounnt
    //                 accountChangedHandler(result[0]);
    //                 setConnButtonText('Wallet Connected');
    //             });
    //     } else {
    //         setErrorMessage('Need to install MetaMask!');
    //     }
    // }

    // const accountChangedHandler = (newAccount) => {
    //     setDefaultAccount(newAccount);
    //     updateEthers();
    // }

    // const updateEthers = async () => {
    //     // Creating a Ethers provider (Metamask)
    //     let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
    //     setProvider(tempProvider);

    //     // MetaMask requires requesting permission to connect users accounts
    //     await provider.send("eth_requestAccounts", []);

    //     // Signer can write to blockchain - provider is read-only
    //     let tempSigner = tempProvider.getSigner();
    //     setSigner(tempSigner);

    //     // Create instance of Contract from the deployed address + abi
    //     let tempContract = new ethers.Contract(contractAddress, SourceDoc_abi, tempSigner);
    //     setContract(tempContract);
        
    // }

    const [progress, setProgress] = React.useState(78);

    const spendingBreakdown = [
        {
            data: [
                { id: 0, value: 20, label: "wages" },
                { id: 0, value: 40, label: "overheads" },
                { id: 0, value: 40, label: "food and drink" },
            ],
            cx: "25%",
            innerRadius: 35,
            outerRadius: 50,
        },
    ];

    const fetchBlockchainData = async (donation) => {
    // useEffect(() => {
    //    (async () => {
            const signer = await connectWalletHandler();
            const response = await getSpend(signer, donation);
            console.log('Response from getSpend:', response);
            setSpendProportion(response?.spendProportion);

            const expenseBreakdown = await getExpenseBreakdown(signer, donation);
            console.log('Expense breakdown: ', expenseBreakdown);
            setExpenseBreakdown(expenseBreakdown);

            const activities = getActivities(signer, donation);

            const transactions = await getProjectTransactions(signer, donation);
            setProjectTransactions(transactions);
        
            
    //     })();
    // }, []);
};
    // Wrap blockchain calling code in once() to ensure it is only
    // called once after component mounts (avoiding costly/unnecessary calls to blockchain)
    const onceFetchBlockchainData = useRef(_.once(fetchBlockchainData));
    const successCallback = useCallback((data) => onceFetchBlockchainData.current(data), []);

    // const parser = new DOMParser();

    // // Given a currency code, convert into an escaped character sequence, and use
    // // DOM parser to convert into Unicode symbol
    // const symb = (currencyCode) => {
    //     if (currencyCode) {
    //         const escapedCharacter = currencySymbol.symbol(currencyCode);
    //         const symbol = parser.parseFromString(escapedCharacter,'text/html').body.textContent;
    //         return symbol;
    //     }
    // }


    // TODO: get from query param instead
    // const donationUUID = "49136ea7-857a-4c44-8537-a61e2737824b";
    const donationUUID = '7'
    // const { data: donation, isError, isLoading } = useGetDonation(donationUUID);
    // const { data: donation, isError, isLoading } = useGetDonation(id, onceFetchBlockchainData);
    const { data: donation, isError, isLoading } = useGetDonation(id, successCallback);
    console.log(donation);


    if (isLoading) {
        return <Loading open={isLoading} />
    }
    
    if (isError) {
        return <p>Error opening donation tracking page</p>
    }


    return (
        <>
            <Container>
                {/* <Typography>Placeholder for blockchain: {connButtonText}</Typography>
                <Button onClick={connectViewOnlyHandler}>Testing</Button>
                <Button onClick={getExpense}>Click me: {message}</Button> */}
                {/* <Typography>Donated funds: {JSON.stringify(donation)}</Typography> */}
                
                {/* <Typography>{errorMessage}</Typography> */}
                {/* <Typography>
                    {JSON.stringify(spendProportion, (key, value) =>
                        typeof value === 'bigint' ? value.toString() : value // Convert BigInt to string
                    )}
                </Typography> */}
                {'Testing transactions'}
                {JSON.stringify(projectTransactions)}
                <Grid container spacing={2}>
                    <Grid item container xs={9}>
                        <Grid item xs={12}>
                            <BasicBreadcrumbs
                                breadcrumbs={[{ label: "Donations", url: "/tracker/donations/list"}, {label: "Track Donation", url: `/tracker/donations/${donation?.uuid}`}]}
                            />
                        </Grid>
                        <Grid item xs={12} mt={1}>
                            <Box sx={{ display: "flex", flexDirection: "row" }}>
                                <Typography variant="h6" fontWeight="bold">
                                    Donations:{" "}
                                </Typography>
                                <Typography>&nbsp;</Typography>
                                <Typography color="text.secondary" variant="h6">
                                    {/* #193B */}
                                    {donation.reference}
                                </Typography>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            {/* <Paper sx={{ marginBottom: 2 }}> */}
                            {/* <Box padding={2}> */}
                            <Typography
                                variant="subtitle1"
                                color={grey[500]}
                                mt={2}
                                // variant='h5'
                                // paddingY={1}
                            >
                                DONATION INFO
                            </Typography>
                            <Divider
                                variant="middle"
                                sx={{
                                    opacity: 0.6,
                                    width: "95%",
                                    mx: "auto",
                                    mt: 1,
                                    mb: 2,
                                }}
                            />
                        </Grid>
                        <Grid
                            item
                            container
                            xs={12}
                            sx={{
                                p: 2,
                                backgroundColor: grey[100],
                                borderRadius: 3,
                            }}
                            alignItems="center"
                            justifyContent="center"
                        >
                            <Grid item xs={6}>
                                <Typography color="text.secondary">
                                    Amount:
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                {/* <span style={{fontWeight: 'bold'}} dangerouslySetInnerHTML={{ __html: currencySymbol.symbol(donation.amount_currency)}} /> */}
                                {/* <span style={{fontWeight: 'bold'}}>{Number(donation.amount).toFixed(2)}</span> */}
                                <span style={{fontWeight: 'bold'}}>{symb(donation.amount_currency)}</span>
                                <span style={{fontWeight: 'bold'}}>{formatCurrency(donation.amount)}</span>
                                {/* <Typography
                                    {currencySymbol.symbol(donation.amount_currency)}{Math.round(donation.amount, 2)}
                                </Typography> */}
                                {/* <Typography sx={{ fontWeight: "bold" }}> */}
                                    {/* £20.00 */}
                                    {/* {`${currencySymbol.symbol(donation.amount_currency)}${Math.round(donation.amount, 2)}`} */}
                                {/* </Typography> */}
                            </Grid>
                            <Grid item xs={6} mt={1}>
                                <Typography
                                    color="text.secondary"
                                    display="inline"
                                >
                                    To:{" "}
                                </Typography>
                            </Grid>
                            <Grid item xs={6} mt={1}>
                                <Typography
                                    // variant="subtitle1"
                                    // color="text.secondary"
                                    fontWeight="bold"
                                    display="inline"
                                >
                                    {/* Oxfam UK */}
                                    {donation.charity_name}
                                </Typography>
                            </Grid>
                            <Grid item xs={6} my={1}>
                                <Typography
                                    // variant="subtitle1"
                                    color="text.secondary"
                                    display="inline"
                                >
                                    Date given:{" "}
                                </Typography>
                            </Grid>
                            <Grid item xs={6} my={1}>
                                <Typography
                                    // variant="body2"
                                    fontWeight="bold"
                                    display="inline"
                                >
                                    {/* {new Date().toDateString()} */}
                                    {new Date(donation.date).toDateString()}
                                </Typography>
                            </Grid>
                        </Grid>
                        {/* <Grid item xs={3} /> */}
                        {/* </Box> */}
                        {/* </Paper> */}
                        <Grid item xs={12}>
                            <Typography
                                variant="subtitle1"
                                color={grey[500]}
                                mt={3}
                                // variant='h5'
                                // paddingY={1}
                            >
                                HOW YOUR MONEY HAS BEEN SPENT
                            </Typography>
                            <Divider
                                variant="middle"
                                sx={{
                                    opacity: 0.6,
                                    width: "95%",
                                    mx: "auto",
                                    mt: 1,
                                    mb: 3,
                                }}
                            />
                        </Grid>
                        <Grid
                            item
                            container
                            xs={12}
                            sx={{
                                p: 2,
                                backgroundColor: grey[100],
                                borderRadius: 2,
                            }}
                            alignItems="center"
                            justifyContent="center"
                            spacing={1}
                        >
                            {/* <Paper>
                            <Box padding={2}>
                                <Typography variant="h5" paddingY={1}>
                                    How your money has been spent
                                </Typography> */}
                            {/* <Grid container spacing={2}> */}
                            <Grid
                                item
                                container
                                xs={6}
                                alignItems="flex-start"
                                direction="column"
                                justifyContent="start"
                                spacing={2}
                                sx={{
                                    justifyContent: "start",
                                }}
                                // sx={{
                                //     display: "flex",
                                //     flexDirection: "column",
                                //     justifyContent: "start",
                                //     alignItems: "flex-start",
                                // }}
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        flex: 1,
                                        justifyContent: "flex-start",
                                        gap: 1,
                                    }}
                                >
                                    <Grid
                                        item
                                        xs={12}
                                        sx={{
                                            display: "flex",
                                            flex: 0,
                                            alignItems: "center",
                                        }}
                                    >
                                        <Typography variant="h6">
                                            Amount spent
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                gap: 0.5,
                                                flexDirection: "column",
                                            }}
                                        >
                                            <Grid item xs={12} sx={{ flex: 0 }}>
                                                <BorderLinearProgress
                                                    variant="determinate"
                                                    // value={progress}
                                                    value={Math.min(Math.max(spendProportion * 100, 3), 100)}
                                                />
                                            </Grid>
                                            {/* <Box sx={{ width: "100%" }}></Box> */}
                                            <Grid item xs={12} sx={{ flex: 0 }}>
                                                <Box
                                                    mt={2}
                                                    sx={{
                                                        display: "flex",
                                                        flexDirection: "row",
                                                        // flexDirection: "column",
                                                        // justifyContent: "center",
                                                        alignItems: "baseline",
                                                        flex: 0,
                                                    }}
                                                >
                                                    <Typography variant="body2" sx={{wordBreak: 'break-word'}}>
                                                        <Typography
                                                            variant="body1"
                                                            fontWeight="bold"
                                                            component="span"
                                                        >
                                                            {/* £17.00{" "} */}
                                                            {symb(donation.amount_currency)}{formatCurrency(donation.amount * spendProportion)}{" "}
                                                        </Typography>
                                                        of your{" "}
                                                        <Typography
                                                            variant="body1"
                                                            component="span"
                                                            fontWeight="bold"
                                                        >
                                                            {/* £20.00{" "} */}
                                                            {symb(donation.amount_currency)}{formatCurrency(donation.amount)}{" "}
                                                        </Typography>
                                                        donation spent so far
                                                    </Typography>
                                                    {/* <Typography
                                                        variant="body2"
                                                        sx={{
                                                            whiteSpace: "nowrap",
                                                        }}
                                                    >
                                                        {" "}
                                                        of your
                                                        <Typography component="span">
                                                            &nbsp;
                                                        </Typography>
                                                        <Typography
                                                            variant="body1"
                                                            component="span"
                                                        >
                                                            £20.00
                                                        </Typography>
                                                    </Typography>
                                                    <Typography>&nbsp;</Typography>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            wordWrap: "break-word",
                                                        }}
                                                    >
                                                        {" "}
                                                        donation
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ wordWrap: "nowrap" }}
                                                    >
                                                        {" "}
                                                        spent so far
                                                    </Typography> */}
                                                </Box>
                                            </Grid>
                                        </Box>
                                    </Grid>
                                    <Grid item sx={{ flex: 1 }} />
                                </Box>
                            </Grid>
                            <Grid
                                item
                                xs={6}
                                sx={{
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    justifyContent: "flex-start",
                                }}

                                // alignItems="flex-start"
                            >
                                <Typography variant="h6">
                                    Breakdown of spending
                                </Typography>
                                {/* {expenseBreakdown == {} ? 
                                    // <Loading open={expenseBreakdown == {}} /> : 
                                    <Typography>Loading</Typography> : */}
                                {/* {expenseBreakdown && expenseBreakdown.length === 9 &&  */}
                                <Box sx={{width: '100%', height: 100}}>
                                    {expenseBreakdown.length > 0 && <PieChart
                                        // series={spendingBreakdown}
                                        series={expenseBreakdown}
                                        // innerRadius={70}
                                        // outerRadius={100}
                                        paddingAngle={2}
                                        cornerRadius={3}
                                        // width={325}
                                        // height={125}
                                        width={285}
                                        height={100}
                                        >  
                                    </PieChart>}
                                    {/* {expenseBreakdown.length > 0 &&
                                        <ResponsiveChartContainer
                                            series={expenseBreakdown}
                                        >
                                            <PieChart
                                                paddingAngle={2}
                                                cornerRadius={3}
                                            />
                                        </ResponsiveChartContainer>
                                    } */}
                                    {expenseBreakdown && console.log("expenseBreakdown passed to PieChart:", expenseBreakdown)}
                                </Box>
                                {/* } */}
                            </Grid>
                        </Grid>
                        {/* </Box> */}
                        {/* </Paper> */}
                        {/* </Grid> */}
                        <Grid item container xs={12} spacing={2}>
                            <Grid item xs={12}>
                                {/* <Typography
                                    sx={{ alignSelf: "start" }}
                                    variant="h5"
                                    paddingY={1}
                                >
                                    Places reached
                                </Typography> */}
                                <Typography
                                    variant="subtitle1"
                                    color={grey[500]}
                                    mt={3}
                                    // variant='h5'
                                    // paddingY={1}
                                >
                                    PLACES REACHED
                                </Typography>
                                <Divider
                                    variant="middle"
                                    sx={{
                                        opacity: 0.6,
                                        width: "95%",
                                        mx: "auto",
                                        mt: 1,
                                        // mb: 2,
                                    }}
                                />
                            </Grid>
                            {/* <Grid item xs={12}>
                                <Box
                                    padding={2}
                                    sx={{
                                        display: "flex",
                                        width: "100%",
                                        flexDirection: "column",
                                        alignItems: "center",
                                        marginTop: 5,
                                        marginBottom: 5,
                                        width: "100%",
                                        height: "100%",
                                    }}
                                >
                                    <img
                                        src={mapPhoto}
                                        style={{
                                            width: "98%",
                                            borderRadius: 5,
                                        }}
                                        alt="impact map"
                                    />
                                </Box>
                            </Grid> */}
                            <Grid item xs={12}>
                                {timelineData.length > 0 && <LeafletMap activities={timelineData}/>}
                            </Grid>
                        </Grid>
                        {/* <Grid item xs={3}></Grid> */}
                    </Grid>

                    <Grid container item xs={3} sx={{}}>
                        <Box style={{ maxHeight: "70vh", overflow: "auto" }}>
                            <Typography variant="h6">
                                Activity updates
                            </Typography>
                            <Grid item xs={12}>
                                <TrackingUpdates data={timelineData} />
                            </Grid>
                        </Box>
                        <Grid item xs={12}>
                            <Divider
                                variant="middle"
                                sx={{
                                    opacity: 0.6,
                                    width: "95%",
                                    mx: "auto",
                                    my: 1,
                                }}
                            />
                        </Grid>
                        {/* <Box style={{ maxHeight: "100vh", overflow: "auto" }}>
                            <Typography variant="h6">
                                Charity updates (non-verified)s
                            </Typography>
                            <Grid item xs={12}>
                                <TrackingUpdates />
                            </Grid>
                        </Box> */}
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};

export default TrackingPage;
