"use client"

import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

// Takes a list of objects as 'data' prop
const BasicTable = ({
    data,
    headers,
    notJournals = false,
    collapsible,
    ...props
}) => {
    // If collapsible component is passed in:
    // 1) extra column in <TableHead>, 2) extra column in <TableBody>
    // 3) Each <TableCell can be clicked to reveal/hide
    // 4) <collapsible> is inserted after every <TableRow>

    const [clicked, setClicked] = React.useState(false);

    return (
        <>
            <Table>
                <TableHead>
                    <TableRow>
                        {collapsible && <TableCell />}
                        {headers.map((header) => (
                            <TableCell align={header.alignRight && "right"}>
                                {header.name}
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((row, index) => (
                        <>
                            <TableRow
                                onclick={setClicked(!clicked)}
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
                                {headers.map((header) => (
                                    <TableCell
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
                        </>
                    ))}
                </TableBody>
            </Table>
        </>
    );
};

export default BasicTable;
