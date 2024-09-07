import React from "react";
import {
    Container,
    Grid,
    Typography,
    Box,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    InputAdornment,
} from "@mui/material";
import { grey } from "@mui/material/colors";
import BasicBreadcrumbs from "./Breadcrumb";
import FormInput from "./dev_code/CreateTransactionModal/FormInput";
import StyledSelect from "./dev_code/Components/StyledSelectUSETHIS";
import { Handshake } from "@mui/icons-material";
import SettingField from "./dev_code/Settings/SettingField";
import { CurrencyPoundOutlined } from "@mui/icons-material";
import EditableTable3 from "./dev_code/Components/ExpenseTableFINAL";

const CreateDonation = () => {
    const breadcrumbs = ["Donations", "Create donation"];

    const donorOptions = {
        donor1: "Donor 1",
        donor2: "Donor 2",
        donor3: "Donor 3",
    };

    // TODO: fields for
    // : 1) donor to select, with (on Blockchain) chip
    // 2) amount
    // 3) Reference
    // 4) Date
    // 5) Description

    return (
        <>
            <Container>
                <BasicBreadcrumbs breadcrumbs={breadcrumbs} />
                <Grid container spacing={2} sx={{ marginTop: 2 }}>
                    <Grid item xs={9}>
                        <Typography variant="h5" fontWeight="bold">
                            Create Donation
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sx={{ mt: 5 }}>
                                <Typography
                                    variant="subtitle1"
                                    color={grey[400]}
                                    // fontWeight="bold"
                                >
                                    DONATION DETAILS
                                </Typography>
                                <Grid item xs={12}>
                                    <List>
                                        <ListItem
                                            disableGutters
                                            secondaryAction={
                                                <StyledSelect
                                                    id="donation-donor"
                                                    placeholder="Select Donor"
                                                    options={donorOptions}
                                                    fullWidth
                                                    sx={{ minWidth: 240 }}
                                                />
                                            }
                                        >
                                            <ListItemText
                                                primary="Donor"
                                                secondary="Select Donor"
                                            />
                                        </ListItem>
                                        <ListItem
                                            disableGutters
                                            secondaryAction={
                                                <FormInput
                                                    id="donation-donor"
                                                    placeholder="Select Donor"
                                                    options={donorOptions}
                                                    fullWidth
                                                    sx={{ minWidth: 240 }}
                                                />
                                            }
                                        >
                                            <ListItemText
                                                primary="Reference"
                                                secondary="Enter donation reference"
                                            />
                                        </ListItem>
                                        <ListItem
                                            disableGutters
                                            secondaryAction={
                                                <FormInput
                                                    id="donation-donor"
                                                    placeholder="Select Donor"
                                                    options={donorOptions}
                                                    fullWidth
                                                    sx={{ minWidth: 240 }}
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment
                                                                position="start"
                                                                component="div"
                                                            >
                                                                <CurrencyPoundOutlined
                                                                    sx={{
                                                                        width: 20,
                                                                        height: 20,
                                                                    }}
                                                                />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            }
                                        >
                                            <ListItemText
                                                primary="Amount"
                                                secondary="Enter the amount of the donation"
                                            />
                                        </ListItem>
                                        <ListItem
                                            disableGutters
                                            sx={{ mt: 3 }}
                                            secondaryAction={
                                                <FormInput
                                                    id="donation-description"
                                                    placeholder="Memo"
                                                    multiline
                                                    minRows={3}
                                                    fullWidth
                                                    sx={{ minWidth: 240 }}
                                                />
                                            }
                                        >
                                            <ListItemText
                                                primary="Reference"
                                                secondary="Enter a description of the donation here"
                                            />
                                        </ListItem>
                                    </List>
                                </Grid>
                                <Grid item xs={12} sx={{ my: 2 }}>
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
                                <Grid item xs={12}>
                                    <Typography
                                        variant="subtitle1"
                                        color={grey[400]}
                                        // fontWeight="bold"
                                    >
                                        ADDITIONAL DONATIONS
                                    </Typography>
                                </Grid>
                                <Grid
                                    item
                                    xs={12}
                                    sx={{
                                        my: 2,
                                    }}
                                >
                                    <EditableTable3 />
                                    {/* <DatePicker
                                        name="transaction.source_doc.date"
                                        sx={{ width: "100%" }}
                                        defaultValue={dayjs("2022-04-17")}
                                        onChange={(newValue) =>
                                            setExpenseData({
                                                ...expenseData,
                                                date: newValue,
                                            })
                                        }
                                    /> */}
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            </Container>
        </>
    );
};

export default CreateDonation;
