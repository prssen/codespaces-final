"use client";

import React, { useCallback } from "react";
import { BiHome, BiBookAlt } from "react-icons/bi";
import { MdAccountBalance } from "react-icons/md";
import { IoIosGift } from "react-icons/io";
import { FaHandshake } from "react-icons/fa";
import { FaUserFriends } from "react-icons/fa";
import { AiOutlineTransaction } from "react-icons/ai";
import { FaProjectDiagram } from "react-icons/fa";

import {
    Box,
    Typography,
    List,
    Divider,
    IconButton,
    Avatar,
    ListItem,
    Collapse,
} from "@mui/material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import Drawer from "@mui/material/Drawer";
// import MuiDrawer from "@mui/material/Drawer";
import { alpha, styled } from "@mui/material/styles";
import { grey } from "@mui/material/colors";

import SidebarItem from "./SidebarItem";
import SidebarGroup from "./SidebarGroup";
// import "./Sidebar.css";
import { Image, LogoutOutlined } from "@mui/icons-material";

// import { useGetProfile } from "../Hooks/useApi";
import { useGetProfile } from "@/lib/hooks/useApi";
// import { useValue } from "../services/context/ContextProvider";
import { useValue } from "@/lib/context/ContextProvider";
// import { Link } from "react-router-dom";

/*
Design ideas:
- See this tutorial: https://www.youtube.com/watch?v=-e3-wtPmGLg
- Icon at top of sidebar to open/close: https://dribbble.com/shots/18369866-Dark-mode-sidebar-navigation-Untitled-UI
    - Also respects Material Design guidelnes: https://m3.material.io/components/navigation-drawer/guidelines
- Rounded inset rect around hovered link: https://dribbble.com/shots/15521957-Timesheet-Mobile-Timer
- Divider in middle, change font, light gray text for inactive, full colour if selectd/hovered: https://dribbble.com/shots/15498327-Haystack-Dashboard-Navigation
    - or primary colour instead of full dark gray for active/hovered text: https://dribbble.com/shots/5593143-Navigation-drawer
- Small subtitle to explain meaning of each option: https://dribbble.com/shots/10399850-Navigation-Drawer-For-Mobile-Devices-for-two-types-of-users
- Vertical line on lHS to indicate active option (rounded in this case): https://dribbble.com/shots/16893777-Ero-Dashboard
- Vertical line to indicate sub-groups: https://dribbble.com/shots/15620579-Nexudus-Navigation
- Divider at bottom for user settings, colour theme, copyright etc: https://dribbble.com/shots/17744423-Navigation-Drawer-Freebie
*/

// const Drawer = styled(
//     MuiDrawer(({ theme }) => ({
//         padding: 8,
//         // "& .MuiDrawer-paper": {
//         //     padding: theme.spacing(2),
//         //     // width: 240,
//         //     // boxSizing: 'border-box',
//         //     // backgroundColor: alpha(theme.palette.background.default, 0.7),
//         // },
//     }))
// );

const drawerWidth = 480;

const Sidebar = ({ width, handleLogin, open, setOpen, ...props }) => {
    const links = [
        { id: 1, name: "Donors", icon: FaUserFriends, url: "/accounting/donors" },
        { id: 2, name: "Donations", icon: IoIosGift, url: "/accounting/donations" },
        {
            id: 3,
            name: "Transactions",
            icon: AiOutlineTransaction,
            // sublinks: [
            //     "Expenses",
            //     "Receipts",
            //     "Donations",
            //     "Invoices",
            //     "Bills",
            // ],
            sublinks: [
                {name: "Expenses", url: "/accounting/expenses"},
                {name: "Receipts"},
                {name: "Donations", url: "/accounting/donations"},
                {name: "Invoices"},
                {name: "Bills"}
            ]
        },
        {
            id: 4,
            name: "Projects",
            icon: FaProjectDiagram,
            url: "/accounting/projects/",
            sublinks: [
                {name: "Summary"},
                {name: "Impact"},
                {name: "Budget"},
                {name: "Transactions"}],
                // "Summary", "Impact", "Budget", "Transactions"],
        },
        {
            id: 5,
            name: "Accounting",
            icon: MdAccountBalance,
            // sublinks: ["Chart of Accounts", "Journals", "Budgets"],
            sublinks: [
                {name: "Chart of Accounts"},
                {name: "Journals"},
                {name: "Budgets"}
            ]
        },
        {
            id: 6,
            name: "Contacts",
            icon: FaHandshake,
            // sublinks: ["Donors", "Suppliers", "Customers"],
            sublinks: [
                {name: "Donors", url: "/accounting/donors"},
                {name: "Suppliers"},
                {name: "Customers"}
            ]
        },
    ];

    // const [open, setOpen] = React.useState(false);
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [groupOpen, setGroupOpen] = React.useState(false);

    const {
        state: { loggedIn },
        dispatch,
    } = useValue();

    const handleClick = (index) => {
        setActiveIndex(index);
        setGroupOpen(!groupOpen);
    };

    // // Credit: improved with AI response
    // const handleGroupClick = useCallback((index) => {
    //     setActiveIndex(index);
    //   }, []);

    const toggleDrawer = () => setOpen(!open);

    const { data: profile, isLoading, isError } = useGetProfile();

    if (profile && !isLoading && !isError) {
        console.log('Profile data passed to UI: ', profile);
    }

    return (
        // <div className="menu">
        //     <div className="logo">
        //         <BiBookAlt />
        //         <h2>EduFlex</h2>
        //     </div>

        //     <div className="menu--list">
        //         {links.map((link) => (
        //             // TODO: change to spans/divs?
        //             <a href="#" className="menu--list--item">
        //                 <link.icon />
        //                 {link.name}
        //                 {/* <span>Dashbaord</span> */}
        //             </a>
        //         ))}
        //     </div>
        // </div>
        <>
            <Drawer
                sx={{ 
                    // width: width,
                    width: width,
                    flexShrink: 0,
                    transition: 'width 0.3s ease-in-out',
                    // position: "relative", //imp
                    // // width: 240, //drawer width
                    // "& .MuiDrawer-paper": {
                    // //   width: 240, //drawer width
                    //   width: width,
                    //   position: "absolute", //imp
                    //   transition: "none !important"
                    // }
                }}
                variant="permanent"
                // variant="persistent"
                anchor="left"
                open={true}
                PaperProps= {{
                    sx: {
                        // backgroundColor: 'white',
                        width: width,
                        boxSizing: 'border-box',
                        border: 1,
                        borderColor: grey[200],
                        transition: 'width 0.3s ease-in-out',
                        ...props?.sx
                    }
                }}
                {...props}
            >
                {/* <Box sx={{ display: "flex", justifyContent: "center" }}> */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        width: "80px",
                        backgroundColor: 'white',
                        my: 2,
                    }}
                >
                    <IconButton onClick={toggleDrawer}>
                        <MenuOutlinedIcon />
                    </IconButton>
                </Box>
                {/* <Box sx={{width: '80px', height: '100px'}} /> */}
                {/* <Divider /> */}
                {/* TODO: delete - this won't be necessary for minimalist design */}
                <List sx={{ flex: 1 }}>
                    {links.map((link, index) => (
                        <>
                            <SidebarItem
                                key={index}
                                onClick={() => handleClick(index)}
                                text={link.name}
                                Icon={link.icon}
                                open={open}
                                url={link.url}
                            />
                            {link.sublinks && (
                                <SidebarGroup
                                    links={link.sublinks}
                                    open={open}
                                    groupOpen={groupOpen}
                                    // setGroupOpen={setGroupOpen}
                                    index={index}
                                    activeIndex={activeIndex}
                                    onClick={() => setActiveIndex(index)}
                                />
                            )}
                        </>
                    ))}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column",
                            mt: 3,
                        }}
                    >
                        <Avatar
                            // src={profile?.avatar && `localhost:8000:${profile.avatar}`}
                            // src={profile?.avatar ? `localhost:8000${profile?.avatar}` : null}
                            src={profile?.avatar}
                            alt={profile?.avatar && "Profile avatar"}
                            sx={{ml: 0.5}}
                            // sx={{
                            //     width: 48,
                            //     height: 48
                            // }}
                            // Only pass the 'imgProps' prop to <Avatar> if
                            // there is an avatar image
                            // {...(profile?.avatar && { imgProps:
                            //     { sx: {
                            //         objectFit: 'cover',
                            //         width: '100%',
                            //         height: '100%'
                            //     }}
                            // }
                            // )}
                            // imgProps={{
                            //     sx: {
                            //         objectFit: 'cover',
                            //         width: '100%',
                            //         height: '100%'
                            //     }
                            // }}
                            onClick={() => handleLogin(true)}
                        >
                            {/* {profile?.avatar 
                                ? <img 
                                    src={profile.avatar} 
                                    alt="Profile avatar" 
                                    styles={{
                                        width: '24px', 
                                        height: 'auto', 
                                        // borderRadius: '50%'
                                    }}/>
                                : <Image onClick={() => handleLogin(true)} />} */}

                                {/* Render placeholder <Image> icon if no profile avatar*/}
                                {/* {!profile?.avatar && <Image />} */}
                            
                        </Avatar>
                        <Collapse orientation="horizontal" in={open}>
                            <Typography
                                variant="body2"
                                fontWeight="bold"
                                mt={1}
                            >
                                {profile?.first_name || profile?.last_name ? `${profile.first_name} ${profile.last_name}` : 'John Smith'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {profile?.profile_charities?.[0]?.charity?.name || 'Charity XYZ'}
                            </Typography>
                        </Collapse>
                    </Box>
                    <ListItem sx={{ flex: 1 }} />
                    <SidebarItem
                        key={-1}
                        // onClick={logOut}
                        text="Log out"
                        Icon={LogoutOutlined}
                        open={open}
                    />
                </List>
            </Drawer>
        </>
    );
};

export default Sidebar;