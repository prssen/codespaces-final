import React, { useCallback, memo } from "react";
import { AccountCircleOutlined } from "@mui/icons-material";
import {
    List,
    ListItem,
    ListSubheader,
    ListItemAvatar,
    ListItemIcon,
    ListItemButton,
    ListItemText,
    Popover,
    IconButton,
    Typography,
    Avatar,
    Divider,
} from "@mui/material";
import { useQueryClient } from "react-query";
import { grey } from "@mui/material/colors";

/*
State: pass anchorEl as prop
in parent, handleClick = set to event.currentTarget; anchroSel = useState(null);

Nested list: {options.map => <ListItem {dataProps}

Old options data structure: [ 'option1', 'option2', [{ 'avatar': 'suboption1', 'name': 'subop1Name' }]]
New one: [ { 'name': 'option1' }, { 'name': 'option2', suboptions: [{ 'blah' }]}]

*/

const PopoverListItem = memo(({ option, index, handleClose }) => {
    const queryClient = useQueryClient();

    // Handler to close popover when popover option is clicked
    const optionClick = (callback) => {
        if (callback) {
            handleClose();
            callback();
            queryClient.clear();
        }
    }

    return (
        <ListItem key={index} sx={{"& :hover": {
            // backgroundColor: 'rgb(241, 242, 244)',
            backgroundColor: grey[100],
            // opacity: 0.5,
            borderRadius: 3
        }}}>
            <ListItemButton 
                data-value={option.value} 
                onClick={() => optionClick(option.callback)}
            >
                {option.avatar && <ListItemAvatar>
                    <Avatar src={option.avatar} />
                </ListItemAvatar>}
                {option.icon && <ListItemIcon>
                    {option.icon}    
                </ListItemIcon>}
                <ListItemText>
                    <Typography>{option.name}</Typography>
                </ListItemText>
            </ListItemButton>
        </ListItem>
    );
});

// Adapted from https://mui.com/material-ui/react-popover/#basic-popover
const StyledPopover = ({ options, optionsComponent, anchorEl, setAnchorEl, ...props }) => {
    // console.log('Options passed to popover: ', options);
    // const [anchorEl, setAnchorEl] = React.useState(null);
    // const refetchAll = useRefetchAll();

    // // Handler to open/close popover
    // const handleClick = (event) => {
    //     setAnchorEl(event.currentTarget);
    // };

    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, [setAnchorEl]);

    const open = Boolean(anchorEl);
    // const open = false;
    const id = open ? "simple-popover" : undefined;
    
    return (
        <Popover
            id={id}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
            }}
            sx={{
                // elevation: 'none',
                ...props.sx
            }}
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    ...props?.PaperProps?.sx
                }
            }}
            {...props}
        >
            <List>
                {optionsComponent ? optionsComponent() : options.map((option, i) => (
                    option.suboptions ?
                        <>
                            <ListSubheader>{option.name}</ListSubheader>
                            {option.suboptions.map((suboption, j) => (
                                <PopoverListItem option={suboption} index={j} handleClose={handleClose} />
                            ))}
                        </>
                        :
                        <PopoverListItem option={option} index={i} handleClose={handleClose} />
                ))}
            </List>
        </Popover>
    );
};

export default StyledPopover;
