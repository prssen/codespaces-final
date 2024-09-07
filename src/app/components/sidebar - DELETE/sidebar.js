"use client";

import React from "react";
import { BiHome, BiBookAlt } from "react-icons/bi";
import { MdAccountBalance } from "react-icons/md";
import { IoIosGift } from "react-icons/io";
import { FaHandshake } from "react-icons/fa";
import { FaUserFriends } from "react-icons/fa";
import { AiOutlineTransaction } from "react-icons/ai";
import { FaProjectDiagram } from "react-icons/fa";

import { Box, Typography, List, Divider, IconButton } from "@mui/material";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import Drawer from "@mui/material/Drawer";
// import MuiDrawer from "@mui/material/Drawer";
import { alpha, styled } from "@mui/material/styles";

import SidebarItem from "./sidebarItem";
import SidebarGroup from "./sidebarGroup";
import "./sidebar.css";

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

const Sidebar = ({ width }) => {
    const links = [
        { id: 1, name: "Donors", icon: FaUserFriends },
        { id: 2, name: "Donations", icon: IoIosGift },
        {
            id: 3,
            name: "Transactions",
            icon: AiOutlineTransaction,
            sublinks: [
                "Expenses",
                "Receipts",
                "Donations",
                "Invoices",
                "Bills",
            ],
        },
        {
            id: 4,
            name: "Projects",
            icon: FaProjectDiagram,
            sublinks: ["Summary", "Impact", "Budget", "Transactions"],
        },
        {
            id: 5,
            name: "Accounting",
            icon: MdAccountBalance,
            sublinks: ["Chart of Accounts", "Journals", "Budgets"],
        },
        {
            id: 6,
            name: "Contacts",
            icon: FaHandshake,
            sublinks: ["Donors", "Suppliers", "Customers"],
        },
    ];

    const [open, setOpen] = React.useState(false);
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [groupOpen, setGroupOpen] = React.useState(false);

    debugger;

    const handleClick = (index) => {
        setActiveIndex(index);
        setGroupOpen(!groupOpen);
    };

    const toggleDrawer = () => {
        console.log("open is ", open);
        setOpen(!open);
    };

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
                sx={{ width: width }}
                variant="permanent"
                anchor="left"
                open={true}
            >
                {/* <Box sx={{ display: "flex", justifyContent: "center" }}> */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        width: "80px",
                    }}
                >
                    <IconButton onClick={toggleDrawer}>
                        <MenuOutlinedIcon />
                    </IconButton>
                </Box>
                <Divider />
                {/* TODO: delete - this won't be necessary for minimalist design */}
                <List>
                    {links.map((link, index) => (
                        <>
                            <SidebarItem
                                key={index}
                                onClick={() => handleClick(index)}
                                text={link.name}
                                Icon={link.icon}
                                open={open}
                            />
                            {link.sublinks && (
                                <SidebarGroup
                                    links={link.sublinks}
                                    open={open}
                                    groupOpen={groupOpen}
                                    // setGroupOpen={setGroupOpen}
                                    index={index}
                                    activeIndex={activeIndex}
                                />
                            )}
                        </>
                    ))}
                </List>
            </Drawer>
        </>
    );
};

export default Sidebar;
