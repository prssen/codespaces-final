import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { TablePagination } from "@mui/material";


/**
 * 
 * Renders a table with pagination given an array of data and header values.
 * 
 * @param {Array[Object]} data list of objects in the form [{ col1: value, col2: value2, ...}]
 * @param {Object} headers in the form [{ name: col1, label: 'Displayed column name'}, {etc...}] 
 * @returns 
 */
const BasicTable = ({
    data,
    headers,
    notJournals = false,
    pagination = true,
    collapsible,
    ...props
}) => {
    // If collapsible component is passed in:
    // 1) extra column in <TableHead>, 2) extra column in <TableBody>
    // 3) Each <TableCell can be clicked to reveal/hide
    // 4) <collapsible> is inserted after every <TableRow>

    const [clicked, setClicked] = React.useState(false);

    const [rows, setRows] = React.useState(data);
    const [page, setPage] = React.useState(0);
    // Setting rowsPerPage to data.length displays all items, effectively disabling pagination
    const [rowsPerPage, setRowsPerPage] = React.useState(pagination ? 5 : data.length);

    const handlePageChange = (event, newPage) => setPage(newPage);
    const handleRowChange = (event, newRows) => setRows(newRows);
    const handleRowsPerPageChange = (event, newRowsPerPage) => setRowsPerPage(newRowsPerPage);

    return (
        <>
            <Table {...props}>
                <TableHead>
                    <TableRow>
                        {collapsible && <TableCell />}
                        {headers.map((header, index) => (
                            <TableCell align={header.alignRight && "right"} key={index}>
                                {header.label || header.name}
                            </TableCell>
                    ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                         .map((row, index) => (
                        <React.Fragment key={index}>
                            <TableRow
                                onClick={() => setClicked(!clicked)}
                                sx={
                                    !notJournals
                                        ? index % 2 === 0 && {
                                              "& td": { border: 0 },
                                          }
                                        : { "& td": { border: 0 } }
                                }
                            >
                                {collapsible && (
                                    <TableCell>
                                        {clicked && <KeyboardArrowDownIcon />}
                                    </TableCell>
                                )}
                                {headers.map((header, j) => (
                                    <TableCell
                                        key={j}
                                        align={header.alignRight && "right"}
                                    >
                                        {row[header.name]}
                                    </TableCell>
                                ))}
                            </TableRow>
                            <TableRow>
                                {/* TODO: Find out if this works when collapsible = undefined (an extra empty row may cause undefined behviour) */}
                                {collapsible}
                            </TableRow>
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>
            {pagination && <TablePagination
                rowsPerPageOptions={[5,10,25]}
                page={page}
                count={rows.length}
                rowsPerPage={rowsPerPage}
                component="div"
                onPageChange={handlePageChange}
                onRowChange={handleRowChange}
                onPagesPerRowChange={handleRowsPerPageChange}
            >
            </TablePagination>}
        </>
    );
};

export default BasicTable;
