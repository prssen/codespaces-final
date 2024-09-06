"use client";

import {
    Typography,
    ListItem,
    ListItemText,
    ListItemButton,
    ListItemIcon,
    Collapse,
} from "@mui/material";
// import { Link } from "react-router-dom";
import { Link } from "next/link";
import { styled, useTheme } from "@mui/material/styles";
import { FaHandshake } from "react-icons/fa";
import { ListActionTypes } from "@mui/base/useList";
import { usePathname } from "next/navigation";

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

const SidebarItem = ({ open, text, Icon, url, sx, ...props }) => {
    const { textStyles, ...rest } = props;
    const theme = useTheme();
    const pathname = usePathname();

    // const isActive = (url) => {
    //     const pathname = location.pathname.startsWith('/') ? 
    //                         location.pathname.slice(1) : 
    //                         location.pathname;
    //     return pathname === url;
    // }

    return (
        <ListItem
            key={text}
            sx={{
                flexShrink: 0,
                ...sx
            }}
            {...rest}
            component={url ? Link : null}
            to={url}
            // selected={window.location.pathname === url}
            selected={pathname === url}
        >
            <ListItemButton
                sx={{
                    flexGrow: 0,
                    flexShrink: 0
                }}
                // component={url ? Link : null}
                // to={url}
            >
                {Icon && (
                    <ListItemIcon sx={{ minWidth: 0 }}>
                        <Icon />
                    </ListItemIcon>
                )}
            </ListItemButton>
            {/* {open && <ListItemText primary={text} />} */}

            {/* <Collapse orientation="horizontal" in={open}> */}
                <ListItemText primary={text} sx={{
                    marginLeft: open ? 0 : 3,
                    transition: 'margin-left 0.3s ease-in-out', 
                    color: "text.primary", ...textStyles?.sx}} {...textStyles} />
            {/* </Collapse> */}
        </ListItem>
    );
};

export default SidebarItem;

// // From copilot - recursive idea is good
// const SidebarItem = ({ title, depthStep = 10, depth = 0, expanded, ...rest }) => {
//     return (
//         <ListItem button dense {...rest}>
//         <ListItemText style={{ paddingLeft: depth * depthStep }}>
//             <Typography variant="body2">{title}</Typography>
//         </ListItemText>
//         </ListItem>
//     );
// };
