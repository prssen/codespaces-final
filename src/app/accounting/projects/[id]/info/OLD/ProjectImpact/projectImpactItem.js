import { Avatar, ListItem, ListItemAvatar, ListItemText } from "@mui/material";

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

export default ProjectImpactItem;
