"use client"
import React from "react";
// import Sidebar from "./Sidebar/Sidebar";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
// import BasicBreadcrumbs from "../Breadcrumb";
import BasicBreadcrumbs from "@/components/Breadcrumb";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import SpeedDial from "@mui/material/SpeedDial";
import Paper from "@mui/material/Paper";
import { PieChart } from "@mui/x-charts/PieChart";

import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import { AddCircleOutline } from "@mui/icons-material";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";

// import BasicTable from "../BasicTable";
// import ProjectImpactTab from "./ProjectImpactTab/ProjectImpactTab";
// import ProjectInfoTab from "./ProjectInfoTab/ProjectInfoTab";
// import ProjectTransactionsTab from "./ProjectTransactionsTab/ProjectTransactionsTab";
// import ProjectEditTab from "./ProjectEditTab/ProjectEditTab";
import ProjectImpactTab from "./impact/ProjectImpactTab";
import ProjectInfoTab from "./info/ProjectInfoTab";
import ProjectTransactionsTab from "./transactions/ProjectTransactionsTab";
import ProjectEditTab from "./edit/ProjectEditTab";

// import { useGetProject, useGetProjectSummary, useGetHome } from "./Hooks/useApi";
import { useGetProject, useGetProjectSummary, useGetHome } from "@/lib/hooks/useApi";
// import Loading from "./Components/Loading";
import Loading from "@/components/Loading"
// import Update from "./Components/Update";
import Update from "@/components/Update";
// import noData from "../../public/no-data.png"
import noData from "/public/images/no-data.png"
import { FiPlus } from "react-icons/fi";
import { useTheme } from "@mui/material";

const accessibilityProps = (index) => {
    return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`,
    };
};

const ProjectTitle = (props) => {
    const { tabValue, index, ...other } = props;

    return (
        <>
            {tabValue === index && (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                    }}
                >
                    <Typography>Cambodia Project 2021-24</Typography>
                    <Button variant="text" sx={{ alignSelf: "flex-end" }}>
                        Edit
                    </Button>
                </Box>
            )}
        </>
    );
};

const ProjectSubtitle = (props) => {
    const { tabValue, index, ...other } = props;

    return (
        <>
            {tabValue === index && (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                    }}
                >
                    <Typography>
                        Early years education Programme: Northern Cambodia
                    </Typography>
                    <Button variant="text" sx={{ alignSelf: "flex-end" }}>
                        Edit
                    </Button>
                </Box>
            )}
        </>
    );
};

const ProjectUpdates = (props) => {
    /*
        Soft dividers between title and description, with grayed 'Title/Description' promps
        Card for each update with Blockquote vertical divider inset on RHS,
            small but bold title just below top of blockquote divider, and description below (lots of padding)
        Side pane, running down entire editable text field, with grayed out + add icon
            And 'Add media' button at the bottom
        Inspired by https://global.discourse-cdn.com/turtlehead/original/2X/1/14cbe02bf33c86a1d8862866176079c60d3cab47.png,
            https://dribbble.com/tags/updates-ui
            https://cdn.dribbble.com/users/126876/screenshots/9697603/media/97ad7a5130e198ee1ab360599bdf92e2.jpg?resize=400x0
            https://i.pinimg.com/originals/5b/47/a7/5b47a70d40b97f541fbc91bcb1026159.png

    */
    const { tabValue, index, ...other } = props;

    return (
        <>
            {tabValue === index && (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                    }}
                >
                    <Typography variant="h6">New Update</Typography>
                    <Paper sx={{ my: 1, p: 2, elevation: 2 }}>
                        <Grid container>
                            <Grid item xs={8}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >
                                    <TextField
                                        id="standard-basic"
                                        placeholder="Title"
                                        variant="standard"
                                    />
                                    <TextField
                                        id="standard-multiline-static"
                                        multiline
                                        rows={4}
                                        placeholder="Enter content here"
                                        variant="standard"
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={4}>
                                <Box sx={{ height: "100%", padding: 3 }}>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            p: 2,
                                            height: "100%",
                                            width: "100%",
                                            borderStyle: "dashed",
                                            borderColor: "lightgray",
                                            borderRadius: 3,
                                        }}
                                    >
                                        <Typography
                                            variant="subtitle2"
                                            sx={{ color: "lightgray" }}
                                        >
                                            Media upload
                                        </Typography>
                                        <CloudUploadOutlinedIcon
                                            style={{ color: "lightgray" }}
                                        />
                                        <input type="file" hidden />
                                    </Box>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>
                    <Typography variant="h6">Previous updates</Typography>
                    <Paper
                        sx={{
                            my: 1,
                            p: 2,
                            elevation: 2,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <Box>
                            <Typography>First update</Typography>
                            {/* <Box
                                sx={{
                                    borderLeft: 2,
                                    height: "80%",
                                    mx: "auto",
                                    width: 1,
                                    alignSelf: "center",
                                    borderColor: "text.secondary",
                                }}
                            /> */}
                            {/* <Divider orientation="vertical" sx={{ pr: 1, height: '100%'}} flexItem/> */}
                            <Typography variant="body2">
                                Lorem ipsum ...
                            </Typography>
                        </Box>
                        <Avatar />
                    </Paper>
                </Box>
            )}
        </>
    );
};

const ProjectInfo = (props) => {
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
                        <Grid container spacing={2} alignItems="stretch">
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
                            <Grid
                                item
                                xs={5}
                                sx={{
                                    display: "flex",
                                }}
                            >
                                <ProjectSpending />
                            </Grid>
                            <Grid item xs={1} />
                            <Grid item xs={6} sx={{ display: "flex" }}>
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

const ProjectSpending = () => {
    // TODO: find out why this isn't working
    // Spaces pie chart labels away from the pie chart - Material UI doesn't seem to provide
    // an API to change the position of pie chart labels directly
    // React.useEffect(() => {
    //     window.onload = function () {
    //         // Get pie chart legend
    //         const pieChartLegend = document.getElementsByClassName(
    //             "MuiChartsLegend-root"
    //         )[0];
    //         const svg = pieChartLegend.parentNode;

    //         // // Insert <svg> element as the legend's parent
    //         // const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    //         // pieChartLegend.parentNode.replaceChild(svg, pieChartLegend);

    //         // Move the legend element to the left hand side of the pie chart container
    //         pieChartLegend.setAttribute(
    //             "transform",
    //             `translate(${svg.clientWidth - pieChartLegend.clientWidth}, 0)`
    //         );
    //     };

    //     return () => {
    //         window.onload = null;
    //     };
    // }, []);

    const spendingBreakdown = [
        {
            data: [
                { id: 0, value: 20, label: "wages" },
                { id: 0, value: 40, label: "overheads" },
                { id: 0, value: 40, label: "food and drink" },
            ],
            // highlightScope: { faded: "global", highlighted: "item" },
            // faded: { innerRadius: 30, additionalRadius: -30, color: "gray" },
        },
    ];

    return (
        <Box
            sx={{
                p: 2,
                display: "flex",
                flexDirection: "column",
                // justifyContent: "flex-start",
                justifyContent: "center",
                gap: 3,
            }}
        >
            <Typography variant="h5">Project spending</Typography>
            <Box sx={{width: '100%', height: 175}}>
                <PieChart
                    series={spendingBreakdown}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    cornerRadius={3}
                    width={375}
                    height={175}
                />
            </Box>
        </Box>
    );
};

// Adapted from https://mui.com/material-ui/react-list/
const ProjectImpact = ({ data, ...props }) => {
    return (
        <Box
            sx={{
                p: 2,
                display: "flex",
                justifyContent: "space-between",
            }}
        >
            <Typography variant="h5">Project impact</Typography>
            <List sx={{ width: "100%", bgcolor: "background.paper" }}>
                {data?.map((item, index) => (
                    <ProjectImpactItem {...item} key={index} />
                ))}
            </List>
        </Box>
    );
};

const ProjectImpactItem = ({
    primaryText,
    secondaryText,
    avatar,
    ...props
}) => {
    return (
        <>
            <ListItem alignItems="flex-start">
                <ListItemAvatar>
                    <Avatar alt="Remy Sharp" src={avatar} />
                </ListItemAvatar>
                <ListItemText primary={primaryText} secondary={secondaryText} />
            </ListItem>
            {/* <Divider variant="inset" component="li" /> */}
        </>
    );
};

const ProjectTransactions = ({ data, headers, ...props }) => {
    return (
        <>
            <Paper sx={{ p: 2, elevation: 2 }}>
                <Typography variant="h5">Transactions</Typography>
                {/* <BasicTable data={data} headers={headers} notJournals /> */}
            </Paper>
        </>
    );
};

const ProjectSummary = () => {
    const breadcrumbs = ["Projects", "Project XYZ"];

    // const { }

    const theme = useTheme();
    // console.log('ProjectSummary theme object is: ', theme);

    // const columns = [
    //     { field: 'id', headerName: 'ID', flex: 1},
    //     { field: 'firstName', headerName: 'First name', flex: 1},
    // ];

    // const rows = [
    //     { id: 1, firstName: 'hello'},
    //     { id: 2, firstName: 'world'},
    // ]

    // Handles change in tab. Code from https://mui.com/material-ui/react-tabs/
    const [value, setValue] = React.useState(0);
    const handleChange = (event, newValue) => {
        console.log("does this run?");
        setValue(newValue);
    };

    const [editMode, setEditMode] = React.useState(false);

    // const { data, isLoading, error } = useGetProjectSummary(
    //     "92c977ea-3002-4b53-b47d-f6c7005972e7"
    // );

    const { data, isLoading, error, isError } = useGetHome();
    const projectUUID = data?.uuid;
    console.log('Currently, projectUUID is', !!projectUUID);

    // The 'enabled' flag determines whether query runs or not -
    // here, doesn't run until projectUIUD returns a value
    const {
        data: projectDetailData,
        isLoading: detailLoading,
        error: detailError,
        isError: isDetailError
    // } = useGetProject("92c977ea-3002-4b53-b47d-f6c7005972e7");
    } = useGetProject(projectUUID, { enabled: !!projectUUID});

    console.log('Detailed project', projectDetailData);
    console.log(`Loading status: ${isLoading} and ${detailLoading}`);

    if (isLoading || detailLoading) return <Loading open={true} />;
    console.log('Error to be displayed is:', error);
    if (error) {
        return (
            <Update
                open={true}
                setOpen={(status) => {}}
                // handleClose={setAlertOpen}
                severity="error"
                message={error.message}
            />
        );
    }

    (!projectUUID & !isError) && breadcrumbs.splice(-1, 1, 'Home');

    return (
        <>
            <Container 
                component={Paper} 
                sx={{
                    elevation: 2, 
                    backgroundColor: 'rgb(247, 250, 255)'
                }}
                // maxWidth={false}
                // disableGutters
            >
            <BasicBreadcrumbs breadcrumbs={breadcrumbs} />
                <Grid container spacing={2} alignItems="center">
                    {(projectUUID && !isDetailError) ? (<>
                    <Grid 
                        item 
                        xs={6} 
                        sx={{
                            alignItems: 'center', 
                            // border: 2, 
                            // borderColor: 'green'
                        }}>
                        <Typography variant="h4" component="h3" gutterBottom>
                            Project XYZ
                        </Typography>
                        {/* 
                        {editMode ? (
                            <TextField placeholder='Edit project here />
                        )} : (
                            <Typography variant="body1">Project Name</Typography>
                        )
                        */}
                    </Grid>
                    <Grid item xs={6} sx={{display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'flex-end' }}>
                    {/* <Grid item xs={6} sx={{ border: 2, borderColor: 'black', justifyContent: 'flex-start', alignItems: 'flex-end', display: 'flex'}}> */}
                        <Box sx={{
                            display: 'flex', 
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            // height: '100%',
                            alignItems: 'flex-end',
                            gap: 1,
                            // border: 2,
                            // borderColor: 'yellow'
                            // justifyContent: 'space-between',
                            // gap: 2
                        }}>
                            <Box sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: 2
                            }}>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <Typography variant="body2">Status:</Typography>
                                    <Chip label="Active" color="success" />
                                </Box>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <Typography variant="body2">Start:</Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {data.start_date}
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 1
                                }}>
                                    <Typography variant="body2">End:</Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {data.end_date || "Ongoing"}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box>
                                {/* <Button variant="contained" endIcon={<AddCircleOutline />}>New Project</Button> */}
                                <Button 
                                    variant="contained" 
                                    endIcon={<FiPlus />}
                                    sx={{borderRadius: 5}}
                                >New Project</Button>
                            </Box>
                        </Box>
                    </Grid>
                    </>) : (<></>)
                    }
                    {/* If there is no project ID retreived and/or the second API call for
                        detailed project data fails, display the 'empty project' UI
                        TODO: simplify this logic
                    */}
                    {/* {projectUUID || (error && !detailError) ? */}
                    {/* {projectUUID || (isError & !isDetailError) ? */}
                    {projectUUID && !isDetailError ?
                        <Grid item xs={12}>
                        <Box
                            sx={{
                                width: "100%",
                            }}
                        >
                            <Tabs
                                value={value}
                                onChange={handleChange}
                                aria-label="Project tabs"
                            >
                                <Tab
                                    label="Summary"
                                    {...accessibilityProps(0)}
                                />
                                <Tab
                                    label="Impact"
                                    {...accessibilityProps(1)}
                                />
                                <Tab
                                    label="Transactions"
                                    {...accessibilityProps(2)}
                                />
                                <Tab label="Edit" {...accessibilityProps(3)} />
                            </Tabs>
                        </Box>
                        {value === 0 && (
                            <ProjectInfoTab
                                data={data}
                                value={value}
                                index={0}
                            />
                        )}
                        {value === 1 && (
                            <ProjectImpactTab
                                value={value}
                                index={1}
                                data={projectDetailData}
                            />
                        )}
                        {value === 2 && (
                            <ProjectTransactionsTab
                                value={value}
                                index={2}
                                data={data}
                            />
                        )}
                        {value === 3 && (
                            <ProjectEditTab
                                value={value}
                                index={3}
                                data={data}
                            />
                        )}
                        </Grid>
                    :
                        <Grid item xs={12}>
                            {/* justify content centre, 1. image, heading 'no project', subtitle 'create a new one with the link above*/}
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    flex: 1,
                                    height: '70vh',
                                    // border: 2,
                                    // borderColor: 'green'
                                }}
                            >
                                {/* <Typography variant="h5">Image here</Typography> */}
                                <Box 
                                    component="img"
                                    sx={{
                                        maxWidth: 'auto',
                                        height: '40%',

                                    }}
                                    alt="No project image"
                                    src={noData}
                                />
                                <Typography variant="body" fontWeight="bold" mt={2}>No project created</Typography>
                                <Typography variant="body2">Create a new project with the link below</Typography>
                                <Button variant="contained" sx={{boxShadow: 'none', marginTop: 2, borderRadius: 5}}>New project</Button>
                            </Box>
                        </Grid>
                    }
                    <Grid item xs={4} />
                </Grid>
            </Container>
        </>
    );
};

export default ProjectSummary;
