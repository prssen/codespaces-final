import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { Box, Avatar } from "@mui/material";
// import makeStyles from "@mui/styles/makeStyles";
// import AppealPhoto from "./assets/charity-appeal.jpeg";
import { grey } from "@mui/material/colors";
// import { Link } from "react-router-dom";
// import Link from 'next/link';
import Link from "@/components/NextLink";

// // Styles from: https://codesandbox.io/p/sandbox/material-ui-full-image-card-qb862?file=%2Fsrc%2Findex.js%3A9%2C1-15%2C1
// const useStyles = makeStyles({
//     container: {
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "center",
//         alignItems: "center",
//     },

// })

// Credit: https://codesandbox.io/p/sandbox/material-ui-full-image-card-qb862?file=%2Fsrc%2Findex.js%3A97%2C15
const AppealCard = ({
    image,
    altText,
    title,
    subtitle,
    avatar,
    primaryButton,
    secondaryButton,
    cardProps,
    cardStyles,
    url,
    ...props
}) => {

    // If a url prop is passed to AppealCard, wrap content in a <Link>
    // component to create a clickable card; otherwise, leave content
    // unchanged
    // const WrapLink = ({ children }) => url ? 
    //     // Link({ to: url, children }) : 
    //     <Link
    //         overlay
    //         underline="none"
    //         href={url}
    //         sx={{ color: 'text.tertiary' }}
    //     >
    //         {children}
    //     </Link>
    //     : children;

    // Adjust domain name to the current host
    let newUrl;
    if (typeof window !== 'undefined' && window.location.origin) {
        const urlString = new URL(url);
        newUrl = `${window.location.origin}${urlString.pathname}${urlString.search}${urlString.hash}`;
    } else {
        newUrl = url;
    }
    
    return (
        <>
            <Card
                sx={{
                    ...cardStyles,
                    // border: 0,
                    // boxShadow: 0.5,
                    // boxShadow: "5px 5px 24px -1px rgba(0,0,0,0.18)",
                    // OR MAYBE
                    // boxShadow: "0px 0px 8px #ddd" // From https://www.youtube.com/watch?v=sWVgMcz8Q44
                    maxWidth: 345,
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column'
                }}
                {...cardProps}
            >
                <CardActionArea 
                    LinkComponent={Link}
                    // to={url}
                    // href={url}
                    href={newUrl}
                    sx={{
                        textDecoration: 'none',
                        color: 'inherit',
                        flex: 1,
                        // padding: 1
                    }}
                // sx={{ padding: 1 }}
                >
                    <CardMedia
                        sx={{ height: 145, borderRadius: 2 }}
                        image={
                            image ||
                            `https://picsum.photos/200/${Math.floor(
                                Math.random() * 10
                            )}`
                        }
                        text={altText || "Charity appeal"}
                    />
                    <CardContent
                    >
                        <Typography
                            gutterBottom
                            variant="subtitle1"
                            sx={{ 
                                fontWeight: "bold", 
                                // lineHeight: 1.5 
                            }}
                            component="div"
                        >
                                {/* {title ||
                                    `Charity appeal ${Math.floor(Math.random() * 4)}`} */}
                                {/* <WrapLink> */}
                                    {title ||
                                        `Charity appeal ${Math.floor(Math.random() * 4)}`}
                                {/* </WrapLink> */}
                        </Typography>
                        <Box
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                            }}
                        >
                            {/* <Avatar
                                alt="Charity logo"
                                src="http://pigment.github.io/fake-logos/logos/vector/color/greens-food-suppliers.svg"
                            /> */}
                            <Avatar
                                sx={{ width: 24, height: 24, mr: 1 }}
                                alt="Charity logo"
                                src={
                                    avatar ||
                                    "http://pigment.github.io/fake-logos/logos/vector/color/greens-food-suppliers.svg"
                                }
                            />
                            <Typography variant="body2" color="text.secondary">
                                {subtitle ||
                                    `Charity ${Math.floor(Math.random() * 20)}`}
                            </Typography>
                        </Box>
                    </CardContent>
                </CardActionArea>
                <CardActions
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}
                    >
                    {secondaryButton || (
                        <Button size="small" color="primary">
                            Learn more
                        </Button>
                    )}
                    {primaryButton || (
                        <Button size="small" variant="outlined" color="primary">
                            Donate
                        </Button>
                    )}
                </CardActions>
            </Card>
        </>
    );
};

export default AppealCard;