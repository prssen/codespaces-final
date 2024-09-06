import {
    Typography,
    ListItem,
    ListItemText,
    ListItemButton,
    ListItemIcon,
    Collapse,
    List,
} from "@mui/material";
import * as React from "react";
import SidebarItem from "./sidebarItem";
import { styled, useTheme } from "@mui/material/styles";
import { FaHandshake } from "react-icons/fa";

// const AnimatedText = styled(ListItemText)(({ theme }) => ({
// transition: theme.transitions.create('width', {
//     easing: theme.transitions.easing.sharp,
//     duration: theme.transitions.duration.enteringScreen,
// }),
// overflow: 'hidden',
// whiteSpace: 'nowrap',
// textOverflow: 'ellipsis',
// width: 0,
// '&.open': {
//     width: 'auto',
// },
// }));

const SidebarGroup = ({
    open,
    groupOpen,
    setGroupOpen,
    index,
    activeIndex,
    links,
}) => {
    const isActive = index === activeIndex;
    console.log(
        `is active? index ${index}: ${activeIndex}, open: ${groupOpen}`
    );

    return (
        <Collapse in={isActive && groupOpen}>
            {/* <List onClick={() => setGroupOpen(!groupOpen)}> */}
            <List>
                {links.map((link) => (
                    <SidebarItem
                        text={link}
                        open={open}
                        textStyles={{ textIndent: 0 }}
                    />
                ))}
                {/* <ListItem key={text}>
                    <ListItemButton
                        sx={{
                            flexGrow: 0,
                        }}
                    >
                        <ListItemIcon sx={{ minWidth: 0 }}>
                            <Icon />
                        </ListItemIcon>
                    </ListItemButton>
                    <Collapse orientation="horizontal" in={open}>
                        <ListItemText primary={text} />
                    </Collapse>
                </ListItem> */}
            </List>
        </Collapse>
    );
};

export default SidebarGroup;
