import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

// TODO: create proper JSDOc comments for each component
// sizes = array of relative sizes for each column (e.g. [3, 1, 1, 2])
// AddLineComponent = optional custom component containing buttons etc. to add/remove lines
// onChange = onChange listener passed to each TextField
const TableInputs = ({
    numLines,
    setNumLines,
    setData,
    headers,
    sizes,
    AddLineComponent,
    onChange,
}) => {
    // Name, path in API output
    // const headers = [
    //     {id: 1, name: 'expense account', path: ''},
    // ]

    // Stores column sizes after normalising to total 12 (see below)
    let normalised;

    // Get column lengths, which should total 12, from a list of relative sizes
    // (e.g. '2', '1' and '3' => '4', '2' and '6')
    if (sizes) {
        // Divide each size by the total, and multiply by 12
        const total = sizes.reduce((acc, cur) => acc + cur, 0);
        normalised = sizes.map((size) => Math.round(size / total) * 12);
        // If total is less than 12, then we need to adjust the last element
        const difference = 12 - normalised.reduce((acc, cur) => acc + cur, 0);
        normalised[normalised.length - 1] += difference;
    }

    // const headers = ['expense account', 'description', 'fund', 'amount'];

    return (
        <>
            <Paper variant="outlined" sx={{ padding: 1, marginTop: 2 }}>
                <Grid container spacing={1}>
                    {headers.map((header, index) => (
                        // <Grid item xs={3}>
                        <Grid item xs={normalised[index]} key={index}>
                            <Typography>{header}</Typography>
                            {new Array(numLines).fill(0).map((_, index) => (
                                <TextField
                                    key={index}    
                                    id={`${header}-${index}`}
                                    inputProps={{ "data-index": index }}
                                    name={header}
                                    margin="dense"
                                    onChange={onChange}
                                />
                            ))}
                        </Grid>
                    ))}
                    {/* <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}> */}
                    {AddLineComponent ? (
                        <AddLineComponent />
                    ) : (
                        <>
                            <Button
                                ml={1}
                                onClick={() => {
                                    setNumLines(numLines - 1);
                                }}
                            >
                                Remove new line item
                            </Button>
                            <Button
                                ml={1}
                                variant="outlined"
                                onClick={() => {
                                    setNumLines(numLines + 1);
                                }}
                            >
                                Add new line item
                            </Button>
                        </>
                    )}
                    {/* </Box> */}
                </Grid>
            </Paper>
        </>
    );
};

export default TableInputs;
