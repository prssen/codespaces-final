/**
 * CircularProgress which allows the colour of the track
 * to be changed (not currently possible out-of-the-box with React MUI)
 * Adapted from: https://stackoverflow.com/a/71439366
 */

import { Box, CircularProgress } from "@mui/material";
import { useTheme } from "@mui/system";
import { blue, green } from "@mui/material/colors";

// const StyledCircularProgress = ({circleColor, trackColor, ...props}) => {
//     const background = {
//         position: 'absolute',
//         zIndex: 1,
//         top: 0,
//         right: 0,
//         // '& svg': {
//         //     color: trackColor,
//         //     '& circle': {
//         //         strokeDashoffset: "0px !important"
//         //     }
//         // }
//     }
//     const foreground = {
//         position: 'absolute',
//         top: 0,
//         right: 0,
//         zIndex: 2,
//         // '& svg': {
//         //     color: circleColor,
//         // }
//     }
//     return (
//         <Box sx={{position: 'relative', display: 'inline-flex', border: 2, borderColor: 'green'}}>
//             <CircularProgress
//                 // variant="determinate"
//                 // thickness={3}
//                 sx={{...foreground, ...props?.sx}}
//                 color={circleColor}
//                 {...props}
//             />
//             <CircularProgress
//                 // variant="determinate"
//                 // value={100}
//                 // thickness={3}
//                 sx={{...background, ...props?.sx}}
//                 color={trackColor}
//                 value="100"
//                 {...props}
//                 // className={"background"}
//             />
//         </Box>
//     );
// }

const StyledCircularProgress = ({ progress = "0.75", size = "40" }) => {
    const theme = useTheme();
    // const colors = tokens(theme.palette.mode);
    const angle = progress * 360;
    return (
      <Box
        sx={{
        //   background: `radial-gradient(${colors.primary[400]} 55%, transparent 56%),
        //       conic-gradient(transparent 0deg ${angle}deg, ${colors.blueAccent[500]} ${angle}deg 360deg),
        //       ${colors.greenAccent[500]}`,
          background: `radial-gradient(${blue[400]}} 55%, transparent 56%),
              conic-gradient(transparent 0deg ${angle}deg, ${blue[500]} ${angle}deg 360deg),
              ${green[500]}`,
          borderRadius: "50%",
          width: `${size}px`,
          height: `${size}px`,
        }}
      />
    );
  };
  

export default StyledCircularProgress;