import React from "react";
import { Backdrop, CircularProgress } from "@mui/material";

// Code adapted from https://www.youtube.com/watch?v=8F6Q7TTc0Sk&list=PLufbXXGswL_pS6rdWbDO56oiZovLWE_rs&index=3
export default function Loading({ open }) {
    // // TODO: Decide whether to show or not depending on global state
    // const { state : { loading}, dispatch} = useValue();

    return (
        <Backdrop
            open={open}
            sx={{
                zIndex: (theme) => theme.zIndex.modal + 1,
            }}
        >
            <CircularProgress sx={{ color: "white" }} />
        </Backdrop>
    );
};

// export default Loading;
