"use client"

import { Typography } from '@mui/material'
import { useGetExpenses, useGetExpenseStatistics } from '@/lib/hooks/useApi';
import { objectSum, objectMean } from '@/lib/utils/utils';
import dayjs from "dayjs";
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import ListViewPage from '@/accounting/list/page';
dayjs.extend(LocalizedFormat)

const ListExpenses = () => {
    // Get expenses data from backend
    const { status: expenseStatus, data: expenseData, isError: isExpenseError, isLoading: isExpenseLoading } = useGetExpenses();
    const { status: analyticsStatus, data: analyticsData, isError: isAnalyticsError, isLoading: isAnalyticsLoading } = useGetExpenseStatistics();

    const isError = isExpenseError || isAnalyticsError;
    const isLoading = isExpenseLoading || isAnalyticsLoading;

    // TODO: refactor all this into 2 functions (1 for expense, 1 for statistics), add as selectors to useQuery

    // Transform data into format required
    const expenses = expenseData?.map((e, index) => ({
        ...e?.line_items[0],
        id: index,
        date: dayjs(e?.line_items[0]?.date).format('LL')
    }));

    const sortedChartData = analyticsData?.expenses_by_month?.sort((a, b) => a.month - b.month);
    const sortedRatioData = analyticsData?.expenses_over_donations?.sort((a, b) => a.month - b.month)
                                                                   .map(e => ({...e, ratio: e.ratio || 0}));
    
    const summaryChartData = {
        chartTitle: 'Expense breakdown',
        data: sortedChartData?.map(e => ({...e, month: dayjs().month(e.month - 1).format('MMM')})),
        keys: ['expense'],
        indexBy: 'month',
    };

    const summaryCardData = [
        { 
            title: `£${Math.round(objectSum(sortedChartData, 'expenses'), 0)}`,
            subtitle: 'Expenses this year', 
            period: 'year', 
            xAxis: sortedChartData?.map(e => e.month),
            yAxis: sortedChartData?.map(e => e.expenses),
            // Increases are a good thing for good indicators, and v. versa
            goodIndicator: false,
        },
        { 
            title: `${Math.round(objectMean(sortedRatioData, 'ratio') * 100, 0)}%`,
            subtitle: 'Expenses as % of donations',
            period: 'year', 
            xAxis: sortedRatioData?.map(e => e.month),
            yAxis: sortedRatioData?.map(e => e.ratio),
            goodIndicator: false,
        },
    ]

    const columns = [
        { field: 'date', headerName: 'Date', flex: 1},
        { field: 'amount', headerName: 'Amount', flex: 1},
        { field: 'dr_account', headerName: 'Debit', flex: 1},
        { field: 'cr_account', headerName: 'Credit', flex: 1},
        { field: 'description', headerName: 'Description', flex: 2}
    ];

    const headerData = {
        title: 'Expenses',
        // TODO: move this to layout page
        breadcrumbs: ['Home', 'Expenses'],
        buttonText: 'New expense',
        buttonLink: '/accounting/expenses/create'
    };

    console.log('Transformed expenses: ', expenses);
    
    if (isLoading) return "Loading...";
    if (isError) return "An error has occurred";
    // if (status !== "success") return "Still not working";
    
    // Pass data to the components
    return (
        <ListViewPage 
            rows={expenses}
            columns={columns}
            headerData={headerData}
            summaryChartData={summaryChartData}
            summaryCardData={summaryCardData}
        />
    );
}

export default ListExpenses;