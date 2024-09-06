import React from "react";
import { Grid, Typography, Divider } from "@mui/material";
import CalendarViz from "./CalendarViz";
// import BasicTable from "../../BasicTable";
import BasicTable from "@/components/BasicTable";
import { grey } from "@mui/material/colors";

const ProjectTransactionsTab = ({ value, index, data, ...props }) => {
    const transactionData = data.transactions;
    console.log('Transaction tab data:', transactionData);

    const exampleData = [
        {
            drAccount: "Wages",
            crAccount: "Cash",
            amount: "250",
            description: "Payment for wages",
        },
        {
            drAccount: "Wages",
            crAccount: "Cash",
            amount: "250",
            description: "Payment for wages",
        },
        {
            drAccount: "Wages",
            crAccount: "Cash",
            amount: "250",
            description: "Payment for wages",
        },
        {
            drAccount: "Wages",
            crAccount: "Cash",
            amount: "250",
            description: "Payment for wages",
        },
    ];

    const headers = [
        { id: 1, name: "date", label: "Date" },
        { id: 2, name: "amount", label: "Amount" },
        { id: 3, name: "description", label: "Description" },
        { id: 4, name: "dr_account", label: "Debit Account" },
        { id: 5, name: "cr_account", label: "Credit Account" },
        { id: 6, name: "fund", label: "Fund" },
    ];

    return (
        value === index && (
            <Grid container sx={{ mt: 3 }}>
                <Grid item xs={12} sx={{ mt: 1 }}>
                    <Typography variant="subtitle1" color={grey[400]}>
                        TRANSACTIONS BY DATE
                    </Typography>
                    <div style={{ height: "350px" }}>
                        <CalendarViz data={transactionData} />
                    </div>
                </Grid>
                <Grid item xs={12}>
                    <Divider
                        variant="middle"
                        sx={{
                            opacity: 0.6,
                            width: "95%",
                            mx: "auto",
                            mt: -1,
                            mb: 1,
                        }}
                    />
                </Grid>
                <Grid item xs={12} sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" color={grey[400]}>
                        RECENT TRANSACTIONS
                    </Typography>
                    <BasicTable
                        data={transactionData}
                        headers={headers}
                        notJournals
                        sx={{
                            mt: 2,
                            // border: 1,
                            borderRadius: 3,
                        }}
                    />
                </Grid>
            </Grid>
        )
    );
};

export default ProjectTransactionsTab;