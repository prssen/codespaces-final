import { Button as MuiButton } from "@mui/material";
import { deepOrange } from "@mui/material/colors";

// TODO: styles from https://www.youtube.com/watch?v=HsdjivqQ7BA: customise
const Button = ({ children, ...props }) => {
    return (
        <MuiButton
            disableRipple
            disableElevation // gives you a 'flat' button
            {...props}
            sx={{
                bgcolor: deepOrange[100], // TODO: experiment with Material colours
                fontSize: "1rem",
                fontWeight: 600, // TODO: is this necessary?
                borderRadius: "8px", // from https://www.youtube.com/watch?v=HsdjivqQ7BA
                "&:hover": {
                    bgcolor: deepOrange[600],
                },
            }}
        >
            {children}
        </MuiButton>
    );
};
