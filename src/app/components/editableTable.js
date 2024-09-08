import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useState } from 'react';
import Input from '@mui/material/Input';


const EditableCell = ({row, name, changeHandler}) => {
    return (
        <TableCell>
            <Input 
                value={row[name]}
                name={name}
                onChange={e => changeHandler(e, row)}
                sx = {{width: 130, height: 40}}
            />
        </TableCell>
    );

}

// Takes a state setter function (like 'setData'), in the 'rowSetter' prop
const EditableTable = ({rows, rowSetter, headers, ...props}) => {
    // Initialise rows with a single object of the form: [{ id: 1, header1: null, header2: null, ...}]
    rowSetter([{...{id: 1}, ...Object.fromEntries(headers.map(key => [key, null]))}]);
    
    // Call 'rowSetter = ([{list of rowData objects}])

    const onChange = (e, row) => {
        // TODO: update the 'rows' state variable with the new 'row[name]' value
        // From https://codesandbox.io/p/sandbox/material-ui-editable-tables-wsp0c?file=%2Fsrc%2Findex.js%3A95%2C21
        const value = e.target.value;
        const name = e.target.name;
        const { id } = row;
        const newRows = rows && rows.map(row => {
          if (row.id === id) {
            return { ...row, [name]: value };
          }
          return row;
        });
        rowSetter(newRows);
    };
    
    return (
        <>
            <Table>
                <TableHead>
                    <TableRow>
                        {headers.map((header, index) => (
                            <TableCell key={index} align={header.alignRight && 'right'}>{header.name}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row, index) => (
                        <TableRow key={index}>
                            {headers.map((header, j) => (
                                <EditableCell
                                    key={j}
                                    name={header}
                                    value={row[header]}
                                    changeHandler={onChange}
                                />
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </>
    );
}

export default EditableTable;