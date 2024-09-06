import { Box, Paper, Grid, Button, Typography, useTheme } from "@mui/material";
import { useState } from 'react';
// import ProjectTitle from "./ProjectTitle";
// import ProjectSubtitle from "./ProjectSubtitle";
// import ProjectUpdates from "./ProjectUpdates";
import ProjectSpending from "./components/ProjectSpending";
import ProjectTransactions from "./components/ProjectTransactions";
// import ProjectImpact from "./ProjectImpact/ProjectImpact";
// import SettingField from "../Settings/SettingField";
// import { Phone } from "@mui/icons-material";
// import { grey, blue } from "@mui/material/colors";
// import AlternativeImpact from "./ProjectImpact/AlternativeProjectImpact";
import ProjectImpactCard from "./components/ProjectImpactCard";
// import IncomeOutgoingChart from "./SpendingSection/IncomeOutgoingChart";
import IncomeOutgoingChart from "./components/IncomeOutgoingChart";
import KeyDonors from "./components/KeyDonors";
// import RecentActivities from "./RecentActivities";
import recentActivities from "./recentActivities.json";
// import TrackingUpdates from "../TrackingPage/TrackingUpdates";
import TrackingUpdates from "@/tracker/donations/[id]/TrackingUpdate";

import { BiChevronDown } from "react-icons/bi";
import _ from 'lodash';

const ProjectInfoTab = (props) => {
    console.log('Project info tab data:', props.data);
    const { value, index, data, ...other } = props;
    const theme = useTheme();

    const [values, setValues] = useState({ title: 'Testing' });

    const [scrolling, setScrolling] = useState(false);

    // Update the form values object with the new value of the appropriate
    // form field
    const handleChange = (event) => setValues(values => {
        return { 
            ...values, 
            [event.target.name]: event.target.value 
        }
    });

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

    // // TODO: check this lines up with data received from API
    // const transactionData = [
    //     {
    //         id: 1,
    //         date: "01/01/24",
    //         description: "Investment income",
    //         drAccount: "Bank account",
    //         crAccount: "Investment income",
    //         fund: "Program Fund",
    //         amount: 1000,
    //     },
    //     {
    //         id: 2,
    //         date: "01/01/24",
    //         description: "School books",
    //         drAccount: "Consumables",
    //         crAccount: "Cash account",
    //         fund: "Program Fund",
    //         amount: 750,
    //     },
    //     {
    //         id: 3,
    //         date: "01/01/24",
    //         description: "Teacher salaries",
    //         drAccount: "Wages",
    //         crAccount: "Bank account",
    //         fund: "Program Fund",
    //         amount: 3500,
    //     },
    // ];

    // Add an ID field for components that require it
    // const transactionData = data.map((e, idx) => (e.index = idx));
    // console.log("Original data: ", data);
    // console.log("Transaction data passed to component: ", transactionData);
    const transactionData = props.data.transactions;

    const transactionHeaders = [
        { id: 1, name: "date" },
        { id: 2, name: "amount" },
        { id: 3, name: "description" },
        { id: 4, name: "dr_account" },
        { id: 5, name: "cr_account" },
        { id: 6, name: "fund" },
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
                <Box 
                    sx={{ 
                        width: "100%",
                        backgroundColor: 'rgb(247, 250, 255)'
                    }}>
                        <Paper
                        sx={{
                            p: 2,
                            margin: "auto",
                            mt: 2,
                            width: "100%",
                            backgroundColor: 'rgb(247, 250, 255)'
                            // border: 2,
                            // borderColor: "green",
                        }}
                    >
                        <Grid
                            container
                            spacing={2}
                            display="flex"
                            alignItems="stretch"
                        >
                            <Grid item xs={12} mt={1} mb={1}>
                                <Typography variant="h5">
                                    Project appeal information
                                </Typography>
                            </Grid>
                            {/* <Grid
                                item
                                xs={4}
                                sx={{
                                    display: "flex",
                                    flexDirection: "row",
                                    justifyContent: "flex-end",
                                    alignItems: "start",
                                }}
                            >
                                <Button variant="outlined">
                                    Launch appeal
                                </Button>
                            </Grid> */}
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
                                {/* <Box sx={{display: 'flex', flexDirection: 'row', borderRadius: 3, backgroundColor: 'white', padding: 2}}> */}
                                    <Grid 
                                        container 
                                        xs={10} 
                                        sx={{
                                            borderRadius: 3, 
                                            backgroundColor: 'white',
                                            border: 1,
                                            // borderColor: purple[300], 
                                            
                                            // Chosen from palette generated by https://m2.material.io/inline-tools/color/ 
                                            // from base color '#f8faff' (current background color)
                                            borderColor: '#dee0e5',
                                            // Credit: background colour + box shadow colour from https://www.youtube.com/watch?v=j0F0l_bvAyU&pp=ygUbcmVhY3QgbWF0ZXJpYWwgdWkgbGlzdCB2aWV3 
                                            boxShadow: '0px 10px 15px -3px rgb(236, 239, 248)',
                                            padding: 2}}
                                    >
                                        {Object.entries(data.appeal).map(([key, value], i) => (
                                            <>
                                                <Grid item xs={3}>
                                                    <Typography text="subtitle2" color="text.secondary">{_.startCase(_.words(key))}: </Typography>
                                                </Grid>
                                                <Grid item xs={7}>
                                                    <Typography text="body2">{value}</Typography>
                                                </Grid>
                                                <Grid item xs={2}>
                                                    {i === 0 ? <Button variant="outlined" noWrap>Publish appeal</Button> : i === 2 ? <Button>Edit</Button> : null}
                                                </Grid>
                                            </>
                                        ))}
                                    </Grid>
                                    {/* <Box sx={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start'}}>
                                        <Button>Publish appeal</Button>
                                        <Button>Edit</Button>
                                    </Box> */}
                                    {/* <Box sx={{display: 'flex', flexDirection: 'row', borderRadius: 3, }}>

                                        <Typography text="subtitle2" color="text.secondary">Title: </Typography>
                                        <Typography text="body2" fontWeight="bold">Charity appeal 123</Typography>
                                    </Box> */}
                                    
                                    {/* <SettingField
                                        title={<Typography fontWeight="bold">Title</Typography>}
                                        // subtitle={
                                        //     "Change your project's appeal title"
                                        // }
                                        // icon={<Phone />}
                                        inset={false}
                                        value={values.phoneNumber}
                                        inputProps={{
                                            name: "title",
                                            onChange: handleChange,
                                        }}
                                        editMode={false}
                                        inputWidth="240px"
                                    /> */}
                                    {/* <ProjectTitle tabValue={tabValue} index={0} />
                                    <ProjectSubtitle
                                        tabValue={tabValue}
                                        index={0}
                                    />
                                    <ProjectUpdates tabValue={tabValue} index={0} /> */}
                                {/* </Box> */}
                            </Grid>
                            <Grid item xs={12} mt={6} mb={3}>
                                {/* <Typography variant="subtitle1" color="grey.400" sx={{textTransform: 'uppercase' }}>Project Spending</Typography> */}
                                <Typography variant="h5">Project spending</Typography>
                            </Grid>
                            <Grid 
                                item 
                                xs={12} 
                                md={6} 
                                sx={{ 
                                    alignItems: 'center',
                                }}>
                                <Paper
                                    sx={{
                                        display: "flex", 
                                        // border: 1,
                                        // borderColor: 'black',
                                        flexDirection: 'column',
                                        // justifyContent: 'center',
                                        alignItems: 'center',
                                        height: '100%',
                                        backgroundColor: '#fff',
                                        paddingX: 1,
                                        paddingY: 2,
                                        marginX: 1,
                                        borderRadius: 3
                                    }}
                                >
                                    <Typography 
                                        variant="subtitle1" 
                                        // color="grey.400" 
                                        color="text.secondary"
                                        sx={{
                                            textTransform: 'uppercase',
                                            // transform: 'translate(-10px, 0px)',
                                            ml: -6
                                        }}
                                    >Expense breakdown</Typography>
                                    <ProjectSpending
                                        sx={{
                                            // p: 2,
                                            // display: "flex",
                                            // flexDirection: "column",
                                            // alignItems: ""
                                            alignItems: "center",
                                            mt: 3,
                                            // border: 1,
                                            // borderColor: 'pink',
                                            // width: "98%",
                                            // height: "100%",
                                        }}
                                        elevation={1}
                                        data={data}
                                    />
                                </Paper>
                                
                                {/* TO DO: delete this?*/}
                                <Grid item xs={6}>

                                </Grid>
                            </Grid>
                            <Grid 
                                item 
                                xs={12} 
                                md={6} 
                                sx={{
                                    alignItems: 'center',
                                    // display: 'flex', 
                                    // flexDirection: 'column',
                                    // // border: 1, 
                                    // // borderColor: 'grey',
                                    // justifyContent: 'center',
                                    // alignItems: 'center'
                                }}>
                                <Paper
                                    sx={{
                                        display: "flex", 
                                        // border: 1,
                                        // borderColor: 'black',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignSelf: 'stretch',
                                        backgroundColor: '#fff',
                                        height: '100%',
                                        paddingX: 1,
                                        paddingY: 2,
                                        marginX: 1,
                                        borderRadius: 3
                                    }}
                                >
                                    <Typography 
                                        variant="subtitle1" 
                                        // color="grey.400" 
                                        color="text.secondary"
                                        sx={{
                                            textTransform: 'uppercase',
                                            // transform: 'translate(-10px, 0px)',
                                            ml: -6
                                        }}
                                    >Project income vs expenses</Typography>
                                    {/* <Typography variant="overline">Project income vs expenses</Typography> */}
                                    <IncomeOutgoingChart />
                                </Paper>
                            </Grid>
                            {/* <Grid item xs={6} sx={{ display: "flex" }}>
                                <ProjectImpact
                                    data={props.data}
                                    sx={{
                                        p: 2,
                                        // width: "80%",
                                        width: "100%",
                                        // border: 2,
                                        // borderColor: "pink",
                                    }}
                                    elevation={0}
                                />
                            </Grid> */}
                            <Grid item xs={12}>
                                <Typography variant="h5">Project impact</Typography>
                            </Grid>
                            <Grid item xs={8} sm={6} md={4}>
                                <ProjectImpactCard />
                            </Grid>
                            <Grid item xs={8} sm={6} md={4}>
                                <ProjectImpactCard />
                            </Grid>
                            <Grid item xs={8} sm={6} md={4}>
                                <ProjectImpactCard />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="h5" mb={2} >Project transactions</Typography>
                                <ProjectTransactions
                                    data={transactionData}
                                    headers={transactionHeaders}
                                    elevation={1}
                                    sx={{
                                        // mx: 1,
                                        p: 2,
                                        borderRadius: 3,
                                        // backgroundColor: 'primary.main'
                                        backgroundColor: 'white'
                                        // backgroundColor: grey[100],
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} md={9} lg={7}>
                                <Typography variant="h5" mb={2}>Key donors</Typography>
                                <KeyDonors sx={{
                                    // backgroundColor: 'background.paper'
                                    borderRadius: 3,
                                    backgroundColor: 'white'
                                }}/>
                            </Grid>
                            <Grid item xs={5}>
                                <Typography variant="h5">Recent activities</Typography>
                                <Box 
                                    sx={{
                                        // height: '100%',
                                        height: 270,
                                        overflowY: 'scroll',
                                        position: 'relative',
                                        marginTop: 2,
                                        zIndex: 100,
                                        borderRadius: 3,
                                        padding: 2,
                                        backgroundColor: 'white'
                
                                    }}
                                    onScroll={() => setScrolling(true)}
                                >
                                    <TrackingUpdates 
                                        data={recentActivities} 
                                        timelineProps={{
                                            // sx: { 
                                            //     margin: 0,
                                            //     border: '1px solid #ccc',
                                            // }
                                        }}
                                        timelineContentProps={{
                                            my: 0,
                                            py: 0
                                            // sx: { border: '1px solid green'}
                                        }}
                                        // timelineContentProps={{ 
                                        //     sx: {
                                                // height: 150,
                                                // overflowY: 'auto',
                                                // border: '1px solid #ccc',
                                                // height: "100%",

                                                // '&::-webkit-scrollbar': {
                                                //     width: '0.4em'
                                                // },
                                                // '&::-webkit-scrollbar-track': {
                                                //     boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
                                                //     webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)'
                                                // },
                                                // '&::-webkit-scrollbar-thumb': {
                                                //     backgroundColor: 'rgba(0,0,0,.1)',
                                                //     outline: '1px solid slategrey'
                                                // }

                                                // marginLeft: 2
                                            // }
                                        // }}
                                    />
                                    {!scrolling && 
                                        <Box 
                                            sx={{
                                                position: 'absolute', 
                                                width: '100%', 
                                                height: '100%',
                                                background: 'linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0) 80%, rgba(255, 255, 255, 1) 100%)',
                                                pointerEvents: 'none',
                                                zIndex: 1000
                                            }}
                                        />} 
                                    {!scrolling && 
                                        <Box 
                                            sx={{
                                                position: 'absolute', 
                                                bottom: 10, 
                                                right: 0, 
                                                zIndex: 10000,
                                            }}>
                                            <Typography color="primary">
                                                <BiChevronDown />{" "}Scroll down
                                            </Typography>
                                        </Box>}                                    
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>
            )}
        </>
    );
};

export default ProjectInfoTab;