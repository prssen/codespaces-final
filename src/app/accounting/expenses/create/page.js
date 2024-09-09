"use client"
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
import {
    Divider,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Avatar,
    CircularProgress,
} from "@mui/material";
// import useForm from "./dev_code/Hooks/formHook";
import useForm from "@/lib/hooks/formHook"
import CloseIcon from "@mui/icons-material/Close";

import ExpenseLineItems from "./ExpenseLineItems";
// import BasicBreadcrumbs from "./Breadcrumb";
import BasicBreadcrumbs from "@/components/Breadcrumb";
// import EditableTable from "./EditableTable";
import EditableTable from "@/components/editableTable";
// import TableInputs from "./TableInputs";
import TableInputs from "@/components/tableInputs";
import { TextField } from "@mui/material";
// import EditableTable2 from "./dev_code/Components/EditableTable2";
// import CreateExpenseTable from "./dev_code/Components/ExpenseTableFINAL";
import CreateExpenseTable from "./components/ExpenseTableFINAL";
import { grey } from "@mui/material/colors";
// import { useValue } from "./dev_code/services/context/ContextProvider";
import { useValue } from "@/lib/context/ContextProvider";

// import { useCreateExpense, useGetSuppliers, useGetProject } from "./dev_code/Hooks/useApi";
import { useCreateExpense, useGetSuppliers, useGetProject } from "@/lib/hooks/useApi";

// import { arr } from "./utils";
import { arr } from "@/lib/utils/utils";
import _ from "lodash";
// import Update from "./dev_code/Components/Update";
import Update from "@/components/Update";

import { DataGrid, gridClasses } from "@mui/x-data-grid";
// import ExpenseSubtotal from "./dev_code/CreateExpense/ExpenseSubtotal";
import ExpenseSubtotal from "./components/ExpenseSubtotal";
// import { expenseSchema } from "./dev_code/Hooks/validationSchema";
import { expenseSchema } from "@/lib/hooks/validationSchema";

// import { useNavigate } from "react-router-dom";
import { useRouter } from "next/router";

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

// TODO: Next.js static prop for fetching data
// Credit: https://www.youtube.com/watch?v=b61rtYhuyag
// export const getStaticProps = (context) => {
//     const data = await getExpenses();

//     return {
//         props: {
//             expenses: data.map((expense) => {
//                 // Remap data to the desired format
//                  return [mapped] || null;
//             })
// .flat(1)
// .filter((expense) => {
//     return expenseData !== null;
// })
//         },
//         revalidate: 60
//     }
// }

// TODO: pass {props} to component

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
    // let navigate = useNavigate();
    let router = useRouter();

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

    // TODO: FINISH THIS
    /*
    // From https://mui.com/x/react-data-grid/editing/#server-side-validation
    const [snackbar, setSnackbar] = useState();
    // TODO: Handler to POST data to the 'create expense' endpoint
    const submitData = (data) => useMutation(send data here)

    // Submit new expense data: if update is successful,
    // redirect to the list expenses page
    const processExpense = React.useCallback(
        async () => {
            const response = await submitData(data);
            if (response.success) {
                setSnackbar({ children: 'Expense successfully added', severity: 'success' });
                // TODO: redirect to 'list expenses' page
            }    
            else if (response.failure) {
                // TODO: show error message above 'submit' button
                setSnackbar({ children: response.errorMessage, severity: 'error' })
            }
            else {
                // TODO: render a loading indicator
            }
        }, [submitData]
    )    
    */

    const successUrl = '/accounting/expenses';
    const successCallback = () => {
        console.log('Expense successfully created. Now navigating away');
        // navigate(successUrl);
        router.push(successUrl);
    }
    const { mutate: createExpense } = useCreateExpense({ callback: successCallback });
    const suppliers = useGetSuppliers();
    const { data: projects, isLoading: isProjectLoading, isError: isProjectError } = useGetProject();
    const [selectedSupplier, setSelectedSupplier] = useState(null);

    const formHandler = (submitEvent, errors) => {
        console.log("API sending code data: ", submitEvent);
        // if (isErrors()) {
        if (errors?.fieldErrors) {
            // setAlertOpen(true);
            setFormError(true);
            setFormErrorMessage(
                "Form has errors: " +
                    Object.values(errors.fieldErrors).join(";")
            );
        } else {
            // const formData = serialize(values);
            // console.log("form data: ", Array.from(formData.entries()));
            // Move projectUUID from project field to every item in transactiosn array
            const { project, date, ...formValues } = values;
            // formValues.line_items = values.line_items.map(e => { _.set(e, 'project.uuid', project); return e; })
            formValues.line_items = values.line_items.map(e => { 
                e.project = project;
                e.date = date;
                return e; 
            })
            console.log("form values are: ", formValues);
            createExpense(formValues);
        }
    };

    const {
        state: { currentCharity },
        dispatch,
    } = useValue();

    const initialValues = {
        supplier_id: "",
        parent_charity: currentCharity,
        payment_type: "",
        expense_type: "",
        line_items: [],
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
    console.log("Testing");
    // const [suppliers, setSuppliers] = useState();
    const [expenseData, setExpenseData] = useState({});

    const [formError, setFormError] = useState(false);
    const closeAlert = (status) => {
        setFormError(false);
        setFormErrorMessage(null);
    };

    const [formErrorMessage, setFormErrorMessage] = useState(null);

    const {
        values,
        setValues,
        updateFormValues,
        formSubmit,
        isErrors,
        errors,
    } = useForm(initialValues, expenseSchema, formHandler);

    console.log("SetValues generated by useForm hook: ", setValues);

    // {/* TODO: add this below the <EditableTable> grid when API calling logic is working */}
    // {/* {!!snackbar && (
    //     <Snackbar
    //     open
    //     anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    //     onClose={handleCloseSnackbar}
    //     autoHideDuration={6000}
    //     >
    //     <Alert {...snackbar} onClose={handleCloseSnackbar} />
    //     </Snackbar>
    // )} */}

    return (
        <ThemeProvider theme={defaultTheme}>
            <Container>
                <Update
                    severity="warning"
                    title="Form Error"
                    message={formErrorMessage}
                    open={formError}
                    setOpen={closeAlert}
                />
                <BasicBreadcrumbs breadcrumbs={breadcrumbs} />
                <Grid container spacing={2} sx={{ marginTop: 2 }}>
                    {/* <AppBar /> */}
                    <Grid item xs={8}>
                        <Typography variant="h5" fontWeight="bold">
                            Create Expense
                        </Typography>
                        {/* <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "baseline",
                                    }}
                                > */}
                        <Grid container spacing={2}>
                            <Grid item xs={12} sx={{ mt: 5 }}>
                                <Typography
                                    variant="subtitle1"
                                    color={grey[400]}
                                    // fontWeight="bold"
                                >
                                    EXPENSE DETAILS
                                </Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        height: "100%",
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Typography>Date</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <DatePicker
                                    // name="transaction.source_doc.date"
                                    name="date"
                                    sx={{ width: "100%" }}
                                    value={values.date}
                                    defaultValue={dayjs("2022-04-17")}
                                    // onChange={(newValue) =>
                                    //     setExpenseData({
                                    //         ...expenseData,
                                    //         date: newValue,
                                    //     })
                                    // }
                                    onChange={(newValue) =>
                                        updateFormValues({
                                            target: {
                                                name: "date",
                                                value: dayjs(newValue).format(
                                                    "YYYY-MM-DD"
                                                ),
                                            },
                                        })
                                    }
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        height: "100%",
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Typography pt={1}>Supplier</Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    id="select-supplier"
                                    select
                                    sx={{ width: "100%" }}
                                    name="supplier_id"
                                    // TODO: check if this should be values.supplier_id instead (or something else)
                                    // value={values.supplier_id.display_name}
                                    SelectProps={{
                                        renderValue: (value) => (
                                            <Typography>
                                                {!suppliers.isLoading &&
                                                    !suppliers.isError &&
                                                    (
                                                        suppliers.data.find(
                                                            (suppl) =>
                                                                suppl.uuid ===
                                                                values.supplier_id
                                                        ) || {}
                                                    ).display_name}
                                            </Typography>
                                            // <MenuItem>
                                            //     <ListItemText>
                                            //         {/* {value.display_name} */}
                                            //         {JSON.stringify(value)}
                                            //     </ListItemText>
                                            // </MenuItem>
                                        ),
                                        // value.display_name,
                                    }}
                                    value={
                                        values.supplier_id
                                        // !suppliers.isLoading &&
                                        // !suppliers.isError &&
                                        // "Testingg"
                                        // (
                                        //     suppliers.data.find(
                                        //         (suppl) =>
                                        //             suppl.uuid ===
                                        //             values.supplier_id
                                        //     ) || {}
                                        // ).display_name
                                    }
                                    onChange={updateFormValues}
                                    helperText="Select or create a new supplier"
                                >
                                    {suppliers.isLoading ? (
                                        <pre>Suppliers loading</pre>
                                    ) : suppliers.isError ? (
                                        <em>
                                            Error - failure to load suppliers
                                        </em>
                                    ) : (
                                        suppliers.data.map((supplier, idx) => (
                                            <MenuItem
                                                key={idx}
                                                value={supplier.uuid}
                                            >
                                                <ListItemIcon>
                                                    {/* <img src="https://picsum.photos/200" /> */}
                                                    <Avatar
                                                        alt="Supplier avatar"
                                                        src={supplier.avatar}
                                                    />
                                                </ListItemIcon>
                                                <ListItemText
                                                    sx={{ marginLeft: 2 }}
                                                >
                                                    {supplier.display_name}
                                                </ListItemText>
                                            </MenuItem>
                                        ))
                                    )}
                                </TextField>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography>Expense Type</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    sx={{ width: "100%" }}
                                    id="select-expense-type"
                                    name="expense_type"
                                    variant="outlined"
                                    error={errors.fieldErrors?.expense_type}
                                    helperText={arr(
                                        errors.fieldErrors?.expense_type
                                    ).join(`; `)}
                                    // error={errors.fieldErrors}
                                    value={values.expense_type}
                                    onChange={updateFormValues}
                                />
                            </Grid>
                            <Grid
                                item
                                xs={6}
                                sx={{
                                    display: "flex",
                                    height: "100%",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                }}
                            >
                                <Typography>Project</Typography>
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    select
                                    sx={{ width: "100%" }}
                                    id="select-project"
                                    name="project"                                    
                                    variant="outlined"
                                    // InputProps={{
                                    //     endAdornment: isProjectLoading && <CircularProgress />
                                    // }}
                                    SelectProps={{
                                        renderValue: (value) => (
                                            <Typography>
                                                {!isProjectLoading &&
                                                    !isProjectError &&
                                                    (
                                                        projects.find(
                                                            (proj) =>
                                                                proj.uuid ===
                                                                values.project
                                                        ) || {}
                                                    ).name}
                                            </Typography>
                                        ),
                                    }}
                                    onChange={updateFormValues}
                                >
                                    {isProjectLoading ? (
                                        <pre>Projects loading</pre>
                                    ) : isProjectError ? (
                                        <em>
                                            Error - failure to load projects
                                        </em>
                                    ) : (
                                        projects?.map((project, idx) => (
                                            <MenuItem
                                                key={idx}
                                                value={project.uuid}
                                            >
                                                {/* <ListItemIcon>
                                                    <Avatar
                                                        alt="Supplier avatar"
                                                        src={supplier.avatar}
                                                    />
                                                </ListItemIcon> */}
                                                <ListItemText
                                                    // sx={{ marginLeft: 2 }}
                                                >
                                                    {project.name}
                                                </ListItemText>
                                            </MenuItem>
                                        ))
                                    )}
                                </TextField>
                            </Grid>
                        </Grid>
                        {/* </Box> */}
                        {/* <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "baseline",
                                    }}
                                >
                                </Box> */}
                        {/* <Grid item xs={3}>
                                {JSON.stringify(expenseData)}
                            </Grid> */}

                        {/* <EditableTable 
                                rows={rows}
                                rowSetter={setRows}
                                headers={expenseLineItemHeaders}
                            /> */}

                        {/* TODO: re-enable if necessary */}
                        {/* <TableInputs
                            numLines={numLines}
                            setNumLines={setNumLines}
                            headers={expenseLineItemHeaders}
                        /> */}

                        {/* <ExpenseLineItems 
                            /> */}
                        {/* <Box
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
                        </Box> */}
                    </Grid>
                    <Grid item xs={4}></Grid>
                    <Grid item xs={8}>
                        <Divider
                            variant="middle"
                            sx={{
                                opacity: 0.6,
                                width: "95%",
                                mx: "auto",
                                my: 3,
                            }}
                        />
                    </Grid>
                    <Grid item xs={4}></Grid>
                    <Grid item xs={8}>
                        <Typography variant="subtitle1" color={grey[400]}>
                            LINE ITEMS
                        </Typography>
                    </Grid>
                    <Grid item xs={4}></Grid>
                    <Grid item xs={12}>
                        {/* <EditableTable2 /> */}

                        <Box sx={{ display: "flex" }}>
                            <CreateExpenseTable
                                values={values}
                                setValues={setValues}
                                sx={{
                                    // a non-existent value ensures default styling is applied
                                    // when no errors are present
                                    borderColor: errors?.fieldErrors?.line_items
                                        ? "red"
                                        : null,
                                }}
                            />
                        </Box>
                    </Grid>
                    {/* <Grid item xs={4}></Grid> */}
                    <Grid item xs={12}>
                        {/* <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                justifyContent: "flex-end",
                                border: 1,
                                borderColor: "pink",
                            }}
                        > */}
                        <ExpenseSubtotal
                            values={values}
                            setValues={setValues}
                        />
                        {/* </Box> */}
                    </Grid>
                    <Grid item xs={12}>
                        <Button
                            variant="contained"
                            // onClick={() => formHandler(values)}
                            onClick={formSubmit}
                        >
                            Create Expense
                        </Button>
                    </Grid>
                    {/* <Grid item xs={4}></Grid> */}
                </Grid>
            </Container>
        </ThemeProvider>
    );
}

export default ExpensePage;
