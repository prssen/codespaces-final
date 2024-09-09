"use client";

import * as React from "react";
import dayjs from "dayjs";
import set from "lodash/set";

import MuiAppBar from "@mui/material/AppBar";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import axios from "axios";
import { useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

// import ExpenseLineItems from "./expenseLineItems";
// import BasicBreadcrumbs from "../../../components/BasicBreadcrumbs";
import BasicBreadcrumbs from "@/components/BasicBreadcrumbs";
// import TableInputs from "../../../components/tableInputs";
import TableInputs from "@/components/tableInputs";
import { TextField } from "@mui/material";
const defaultTheme = createTheme();

const AppBar = styled(MuiAppBar)(({ theme }) => ({
    // zIndex: theme.zIndex.drawer + 1,
    width: `calc(100%)`,
}));

const createExp = async (dataObject) => {
    const { supplier, expense_type, date, amount } = dataObject;
    const { data } = await axios.post(
        "http://localhost:8000/dj-rest-auth/registration",
        {
            supplier,
            expense_type,
            transaction: {
                vat_rate: {
                    name: "STD",
                    amount: "20%",
                    description: "Standard rate",
                },
                source_doc: { date: date },
                entries: [
                    {
                        account: {},
                    },
                ],
            },
        }
    );
    return data;
};

function ExpensePage() {
    // // From https://stackoverflow.com/q/73959381
    // // TODO: improve, change, add 'onChange={handleChange} to form fields
    // const handleChange = (event) => {
    //     setData(event.target.value);
    //   };

    // // From https://stackoverflow.com/questions/73959381/how-to-show-data-fetched-from-api-in-select-mui
    // // TODO: IMPROVE AND CHANGE, add 'onClick={handeSubmit}' to form button
    // const handleSubmit = (evnt,) => {
    //     evnt.preventDefault();
    //     axios.post('http://localhost:8006/api/v2/add/transfer')
    //       .then(response => {
    //         if (response.data.success === true) {
    //           alert(response.data.message)
    //         }
    //       })
    //       .catch(error => {
    //         console.log(error.message)
    //       });
    //   }

    const handleChange = (e) => {
        // Remove the 'id' field, and make it fit the Expense -> Transaction -> TransactionDetail API format
        // E.g. create a Dr TransactionDetail with the expense, Cr with 'paid through'

        // Credit: https://stackoverflow.com/a/67692022
        let copiedState = JSON.parse(JSON.stringify(expenseData));
        if (e.target.value) set(copiedState, e.target.name, e.target.value);
        setExpenseData(copiedState);

        // Use _.set(object, path, value) [clears with null, so check 'if event.target.value exists, then set()]
        // Create balancing entry (direction = -1, account = payment account)
    };

    const [error, setError] = React.useState();
    const [status, setStatus] = React.useState();

    // Adapted from https://www.youtube.com/watch?v=seU46c6Jz7E
    const fetchData = async (route, setState) => {
        try {
            setStatus("loading");
            const data = axios.get(route).then((response) => response.data);
            setState(data);
            setError(error);
            setStatus("success");
        } catch (error) {
            setError(error);
            setStatus("error");
        }
    };

    // Takes: route to POST to, values to POST, and getter [array of function + params] to display updated data(??)
    const postData = async (route, values, getterArray) => {
        try {
            // TODO: create separate status/error variables
            setStatus("loading");
            const data = axios.post(route, values);
            setError(error);
            setStatus("success");
        } catch (error) {
            setError(error.message);
            setStatus("error");
        }
    };

    // React.useEffect(() => {
    //     (async () => {
    //         // Get supplier, accounts data from POST endpoint
    //         // setSuppliers(fetchedData)

    //         // Code from https://blog.logrocket.com/modern-api-data-fetching-methods-react/
    //         const getData = async () => {
    //             try {
    //               const response = await axios.get(
    //                 `https://jsonplaceholder.typicode.com/posts?_limit=10`
    //               );
    //               setData(response.data);
    //               setError(null);
    //             } catch (err) {
    //               setError(err.message);
    //               setData(null);
    //             } finally {
    //               setLoading(false);
    //             }
    //           };
    //           getData();
    //     })();
    // }, []);

    const getTotal = (data) => {
        // calculate total of line items in table
    };

    const breadcrumbs = ["Expenses", "Create Expense"];
    const expenseLineItemHeaders = [
        "expense account",
        "description",
        "fund",
        "amount",
    ];
    const paymentTypes = [
        "Cash",
        "Credit card",
        "Debit card",
        "Cheque",
        "Bank transfer",
        "Mobile wallet",
        "Cryptocurrency",
    ];

    const [rows, setRows] = useState([
        {
            ...{ id: 1 },
            ...Object.fromEntries(
                expenseLineItemHeaders.map((key) => [key, null])
            ),
        },
    ]);
    const [numLines, setNumLines] = useState(1);

    const [suppliers, setSuppliers] = useState();
    const [expenseData, setExpenseData] = useState({});

    return (
        <ThemeProvider theme={defaultTheme}>
            <Container>
                <BasicBreadcrumbs breadcrumbs={breadcrumbs} />
                <Grid container spacing={2} sx={{ marginTop: 2 }}>
                    {/* <AppBar /> */}
                    <Grid item xs={9}>
                        <Typography variant="h3">Create Expense</Typography>
                        <Grid container>
                            <Grid item xs={9}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "baseline",
                                    }}
                                >
                                    <Typography>Date</Typography>
                                    <DatePicker
                                        sx={{ transform: "scale(0.8)" }}
                                        name="transaction.source_doc.date"
                                        defaultValue={dayjs("2022-04-17")}
                                        onChange={(newValue) =>
                                            setExpenseData({
                                                ...expenseData,
                                                date: newValue,
                                            })
                                        }
                                    />
                                </Box>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "baseline",
                                    }}
                                >
                                    <Typography>Supplier</Typography>
                                    <TextField
                                        select
                                        name="supplier"
                                        helperText="Select or create a new supplier"
                                    ></TextField>
                                </Box>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "baseline",
                                    }}
                                >
                                    <Typography>Expense Type</Typography>
                                    <TextField
                                        id="select-expense-type"
                                        variant="outlined"
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={3}>
                                {/* {JSON.stringify(expenseData)} */}
                            </Grid>
                        </Grid>

                        {/* <EditableTable 
                                rows={rows}
                                rowSetter={setRows}
                                headers={expenseLineItemHeaders}
                            /> */}
                        <TableInputs
                            numLines={numLines}
                            setNumLines={setNumLines}
                            headers={expenseLineItemHeaders}
                        />
                        {/* <ExpenseLineItems 
                            /> */}
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "flex-end",
                            }}
                        >
                            <Typography variant="h6" mr={2}>
                                Total:
                            </Typography>
                            <Typography variant="h6" sx={{ marginRight: 12 }}>
                                £ {getTotal()}
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={3}></Grid>
                </Grid>
            </Container>
        </ThemeProvider>
    );
}

export default ExpensePage;
