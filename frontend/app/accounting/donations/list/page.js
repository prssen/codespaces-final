"use client"

import ListViewPage from '@/accounting/list/page';
import { useGetDonationAccounting, useGetDonationStatistics } from '@/lib/hooks/useApi';
import { Typography } from '@mui/material';
import { paymentMethods } from '@/lib/utils/constants';
import { objectSum, objectMean, formatCurrency } from '@/lib/utils/utils';
import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(LocalizedFormat);

const ListDonations = () => {
    const { data: donationData, isLoading: isDonationLoading, isError: isDonationError } = useGetDonationAccounting();
    const { data: analyticsData, isLoading: isAnalyticsLoading, isError: isAnalyticsError } = useGetDonationStatistics();
    
    const isError = isAnalyticsError || isDonationError;
    const isLoading = isAnalyticsLoading || isDonationLoading;

    const donations = donationData?.map((e, index) => ({
        ...e,
        // amount: `£${Math.round(e?.amount, 2)}`,
        amount: `£${formatCurrency(e?.amount)}`,
        date: dayjs(e?.date).format('LL'),
        paymentMethod: paymentMethods[e?.payment_method]
    }));

    // Cards = donations by month, avg donations by month
    // Chart = donations by month

    const sortedChartData = analyticsData?.donations_by_month_this_year?.sort((a, b) => a.month - b.month);
    const sortedAverageData = analyticsData?.average_donation_by_month_this_year?.sort((a, b) => a.month - b.month);

    const summaryChartData = {
        chartTitle: 'Donations by month',
        data: sortedChartData?.map(e => ({...e, month: dayjs().month(e.month - 1).format('MMM')})),
        keys: ['total'],
        indexBy: 'month',
    }

    const summaryCardData = [
        {
            // title: `£${formatCurrency(Math.round(objectSum(sortedChartData, 'total'), 0))}`,
            // value for 'total' property of the last month object in array (most recent month)
            title: `£${formatCurrency(Math.round(sortedChartData?.slice(-1)[0]['total'], 0))}`,
            subtitle: 'Donations this month', 
            period: 'year', 
            xAxis: sortedChartData?.map(e => e.month),
            yAxis: sortedChartData?.map(e => e.total),
            // Increases are a good thing for good indicators, and vice versa
            goodIndicator: true,
        },
        {
            title: `£${formatCurrency(Math.round(analyticsData?.average_donation, 0))}`,
            subtitle: 'Size of average donation',
            period: 'year', 
            xAxis: sortedAverageData?.map(e => e.month),
            yAxis: sortedAverageData?.map(e => e.total),
            goodIndicator: true,
        }
    ];

    console.log('Sorted average data: ', sortedAverageData);
    console.log('Card titles are: ', summaryCardData.map(e => e.title));

    const headerData = {
        title: 'Expenses',
        breadcrumbs: ['Home', 'Donations'],
        buttonText: 'New donation'
    }

    const columns = [
        { field: 'date', headerName: 'Date', flex: 1},
        { field: 'amount', headerName: 'Amount', flex: 1},
        { field: 'donor', headerName: 'Donor', flex: 1},
        { field: 'paymentMethod', headerName: 'Payment method', flex: 1},
        { field: 'memo', headerName: 'Description', flex: 2}
    ]

    if (isLoading) return "Loading...";
    if (isError) return "An error has occurred";

    return (
        // <>
        //     <Typography>{JSON.stringify(donationData)}</Typography>
        //     <Typography>{JSON.stringify(donorAnalyticsData)}</Typography>
        // </>
        <ListViewPage 
            rows={donations}
            columns={columns}
            headerData={headerData}
            summaryChartData={summaryChartData}
            summaryCardData={summaryCardData}
        />
    );
}

export default ListDonations;