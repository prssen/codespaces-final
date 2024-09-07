import { Box, Paper, Grid, Button, Typography } from "@mui/material";
import ProjectTitle from "./projectTitle";
import ProjectSubtitle from "./projectSubtitle";
import ProjectUpdates from "./projectUpdates";
import ProjectSpending from "./projectSpending";
import ProjectTransactions from "./projectTransactions";
import ProjectImpact from "./ProjectImpact/projectImpact";

const ProjectInfoTab = (props) => {
    const { value, index, ...other } = props;

    const impactData = [
        {
            id: 1,
            primaryText: 172,
            secondaryText: "Children impacted",
            avatar: "https://mui.com/static/images/avatar/1.jpg",
        },
        {
            id: 2,
            primaryText: 20,
            secondaryText: "Staff employed",
            avatar: "https://mui.com/static/images/avatar/2.jpg",
        },
        {
            id: 3,
            primaryText: 5,
            secondaryText: "Schools built",
            avatar: "https://mui.com/static/images/avatar/3.jpg",
        },
    ];

    // TODO: check this lines up with data received from API
    const transactionData = [
        {
            id: 1,
            date: "01/01/24",
            description: "Investment income",
            drAccount: "Bank account",
            crAccount: "Investment income",
            fund: "Program Fund",
            amount: 1000,
        },
        {
            id: 2,
            date: "01/01/24",
            description: "School books",
            drAccount: "Consumables",
            crAccount: "Cash account",
            fund: "Program Fund",
            amount: 750,
        },
        {
            id: 3,
            date: "01/01/24",
            description: "Teacher salaries",
            drAccount: "Wages",
            crAccount: "Bank account",
            fund: "Program Fund",
            amount: 3500,
        },
    ];

    const transactionHeaders = [
        { id: 1, name: "date" },
        { id: 2, name: "description" },
        { id: 3, name: "drAccount" },
        { id: 4, name: "crAccount" },
        { id: 5, name: "fund" },
        { id: 6, name: "amount" },
    ];

    // const [tabValue, setTabValue] = React.useState(2);
    let tabValue = 0;

    // const handleTabChange = (event, newValue) => {
    //     console.log("does this run?");
    //     setTabValue(newValue);
    // };

    return (
        <>
            {value === index && (
                <Box sx={{ width: "100%" }}>
                    <Paper sx={{ p: 2, margin: "auto", mt: 2 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={8}>
                                <Typography variant="h5">
                                    Project Information
                                </Typography>
                            </Grid>
                            <Grid item xs={4}>
                                <Button variant="outlined">
                                    Launch appeal
                                </Button>
                            </Grid>
                            {/* <Grid item xs={12}>
                                <Tabs
                                    value={tabValue}
                                    onChange={handleTabChange}
                                    aria-label="Project tabs"
                                >
                                    <Tab
                                        label="Title"
                                        {...accessibilityProps(0)}
                                    />
                                    <Tab
                                        label="Subtitle"
                                        {...accessibilityProps(1)}
                                    />
                                    <Tab
                                        label="Updates"
                                        {...accessibilityProps(2)}
                                    />
                                </Tabs>
                            </Grid> */}
                            <Grid item xs={12}>
                                <ProjectTitle tabValue={tabValue} index={0} />
                                <ProjectSubtitle
                                    tabValue={tabValue}
                                    index={1}
                                />
                                <ProjectUpdates tabValue={tabValue} index={2} />
                            </Grid>
                            <Grid item xs={6}>
                                <ProjectSpending />
                            </Grid>
                            <Grid item xs={6}>
                                <ProjectImpact data={impactData} />
                            </Grid>
                            <Grid item xs={12}>
                                <ProjectTransactions
                                    data={transactionData}
                                    headers={transactionHeaders}
                                />
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>
            )}
        </>
    );
};

export default ProjectInfoTab;
