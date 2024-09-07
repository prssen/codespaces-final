"use client"
import { useState } from 'react';
import { getProjectTransactions } from '@/api/lib/'
import { expenseTypes } from '@/lib/utils/constants';

const useTransactionTable = () => {
    const [rows, setRows] = useState([]);
    const [columns, setColumns] = useState([
        { field: 'timestamp', headerName: 'Date', flex: 1},
        { field: 'expenseType', headerName: 'Expense type', flex: 1},
        { field: 'total', headerName: 'amount', flex: 1},
        { field: 'isConfirmed', headerName: 'Confirmed', flex: 1},
        { field: 'details', headerName: 'Details', flex: 2},
    ]);
    const [sortModel, setSortModel] = useState([]);
    const [error, setError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch table data from blockchain
    useEffect(() => {
        const fetchData = async () => {
            try {
                const transactions = await getProjectTransactions();
                setRows(
                    transactions.map((e, index) => ({ ...e, id: index}))
                );
            } catch (error)  {
                setError(error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [])

    // Filter by expenseType
    const filters = expenseTypes.map(expenseType => ({
        name: expenseType,
        value: expenseType,
    }));
    filters = filters.map(e => ({
        ...e,
        callback: () => rows.filter(row => row.expenseType === e.value)
    }));

    const [anchorEl, setAnchorEl] = React.useState(null);
    const handleFilterClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    return {
        // For data fetching
        error, isLoading,
        // For data table
        rows, columns, sortModel, setSortModel,
        // For filter popover and icon
        anchorEl, setAnchorEl, handleFilterClick
    };
    
}