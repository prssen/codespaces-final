import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
// import makeStyles from "@mui/styles/makeStyles";
// import AppealPhoto from "@/public/assets/charity-appeal.jpeg";
import AppealPhoto from "public/images/charity-appeal.jpeg";

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
const AppealCard = () => {
    return (
        <>
            <Card sx={{ maxWidth: 345 }}>
                <CardActionArea>
                    <CardMedia
                        sx={{ height: 145 }}
                        image={`https://picsum.photos/200/${Math.floor(
                            Math.random() * 10
                        )}`}
                        text="Charity appeal"
                    />
                </CardActionArea>
                <CardContent>
                    <Typography
                        gutterBottom
                        variant="subtitle1"
                        sx={{ fontWeight: "bold" }}
                        component="div"
                    >
                        Charity appeal {Math.floor(Math.random() * 4)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Charity {Math.floor(Math.random() * 20)}
                    </Typography>
                </CardContent>
                <CardActions
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "center",
                    }}
                >
                    <Button size="small" color="primary">
                        Learn more
                    </Button>
                    <Button size="small" variant="outlined" color="primary">
                        Donate
                    </Button>
                </CardActions>
            </Card>
        </>
    );
};

export default AppealCard;
