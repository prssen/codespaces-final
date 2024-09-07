import {
    Typography,
    ListItem,
    ListItemText,
    ListItemButton,
    ListItemIcon,
    Collapse,
} from "@mui/material";
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

const SidebarItem = ({ open, text, Icon, ...props }) => {
    const { textStyles, ...rest } = props;
    return (
        <ListItem key={text} {...rest}>
            <ListItemButton
                sx={{
                    flexGrow: 0,
                }}
            >
                {Icon && (
                    <ListItemIcon sx={{ minWidth: 0 }}>
                        <Icon />
                    </ListItemIcon>
                )}
            </ListItemButton>
            {/* {open && <ListItemText primary={text} />} */}
            <Collapse orientation="horizontal" in={open}>
                <ListItemText primary={text} {...textStyles} />
            </Collapse>
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
