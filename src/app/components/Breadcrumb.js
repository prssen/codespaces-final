import * as React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
// import Link from "@mui/material/Link";
import Link from "@/components/NextLink";
import Breadcrumbs from "@mui/material/Breadcrumbs";

function handleClick(event) {
    event.preventDefault();
    console.info("You clicked a breadcrumb.");
}

// Credit: https://mui.com/material-ui/react-breadcrumbs/#basic-breadcrumbs
export default function BasicBreadcrumbs({ breadcrumbs, sx, ...props }) {
    // console.log('Breadcrumbs reached: ' + JSON.stringify(breadcrumbs));
    return (
        <Box role="presentation" onClick={handleClick} sx={sx}>
            <Breadcrumbs aria-label="breadcrumb" {...props}>
                {/* {breadcrumbs.slice(0, -1).map((link) => ( */}
                {breadcrumbs.slice(0, -1).map((crumb, i) => (
                    // <Link underline="hover" color="inherit" href="/">
                    <Link underline="hover" color="inherit" href={crumb.url ?? ''} key={i}>
                        {/* {link} */}
                        {crumb.label}
                    </Link>
                ))}
                <Typography color="text.primary">
                    {/* {breadcrumbs.slice(-1)} */}
                    {breadcrumbs.slice(-1)[0].label}
                </Typography>
                {/* <Link underline="hover" color="inherit" href="/">
          MUI
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href="/material-ui/getting-started/installation/"
        >
          Core
        </Link>
        <Typography color="text.primary">Breadcrumbs</Typography> */}
            </Breadcrumbs>
        </Box>
    );
}
