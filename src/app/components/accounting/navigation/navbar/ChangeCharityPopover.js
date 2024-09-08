"use client"

import React from "react";
import { AccountCircleOutlined } from "@mui/icons-material";
import {
    List,
    ListItem,
    ListSubheader,
    ListItemAvatar,
    ListItemButton,
    ListItemText,
    Popover,
    IconButton,
    Typography,
    Avatar,
    Divider,
} from "@mui/material";
// import { useRefetchAll } from "../Hooks/useApi";
import { useRefetchAll } from "@/lib/hooks/useApi";
import { useQueryClient } from "react-query";
import { useTheme } from "@mui/material/styles";

// Adapted from https://mui.com/material-ui/react-popover/#basic-popover
const ChangeCharityPopover = ({ options, icon, iconSize, iconStyles, isTracker, ...props }) => {
    console.log('Options passed to popover: ', options);
    const [anchorEl, setAnchorEl] = React.useState(null);
    const queryClient = useQueryClient();
    const theme = useTheme();

    // const refetchAll = useRefetchAll();

    // Handler to open/close popover
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    // Handler to close popover when popover option is clicked
    const optionClick = (callback) => {
        if (callback) {
            handleClose();
            callback();
            queryClient.clear();
        }
    }

    const open = Boolean(anchorEl);
    // const open = false;
    const id = open ? "simple-popover" : undefined;

    console.log('Is tracker is: ', isTracker);

    return (
        <>
            <IconButton
                aria-describedby={id}
                // aria-describedby="simple-popover"
                onClick={handleClick}
                iconSize={iconSize}
                sx={iconStyles}
            >
                {icon ? icon({isClicked: open}) : <AccountCircleOutlined />}
            </IconButton>
            <Popover
                id={id}
                // id="simple-popover"
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                }}
                sx={{
                    borderRadius: 3,
                    // elevation: 'none',
                    // ...(theme.palette.mode === 'light' && {backgroundColor: 'white'}), 
                    ...props.sx
                }}
                {...props}
            >
                <List>
                    {/* {!isTracker && <>
                    <ListItem>
                        <ListItemText>
                            <Typography>
                                <em>Select charity</em>
                            </Typography>
                        </ListItemText>
                    </ListItem>
                    <Divider
                        variant="middle"
                        sx={{
                            opacity: 0.6,
                            width: "95%",
                            mx: "auto",
                            my: 1,
                        }}
                    />
                    </>} */}
                    {options?.length > 0 && options.map((option, i) => (
                        Array.isArray(option)
                        ?
                            <>
                                <ListSubheader sx={theme.palette.mode === 'light' && {backgroundColor: 'white'}}>{option[0]}</ListSubheader>
                                {option.slice(1).map((suboption, j) => (
                                    <ListItem key={j}>
                                        <ListItemButton onClick={() => optionClick(suboption.callback)}>
                                            {suboption.avatar && <ListItemAvatar>
                                                <Avatar src={suboption.avatar} />
                                            </ListItemAvatar>}
                                            <ListItemText>
                                                <Typography>{suboption.name}</Typography>
                                            </ListItemText>
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </>
                        : 
                            <ListItem key={i}>
                                <ListItemText>
                                    <Typography>{option}</Typography>
                                </ListItemText>
                            </ListItem>
                    ))}
                </List>
            </Popover>
        </>
    );
};

export default ChangeCharityPopover;