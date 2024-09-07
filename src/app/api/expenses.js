import axios from "axios";

const clientId = process.env.NEXT_PUBLIC_UNSPLASH_CLIENT_ID;

const BASE_URL = "http://localhost:3000";

export const getAllExpenses = async () => {
    const token = localStorage.getItem("token");

    const { data } = await axios.get(`${BASE_URL}/expenses/`, {
        headers: {
            Authorization: `Token ${token}`,
        },
        withCredentials: true,
    });
    return data;
};

export const getAllExpensesPaginated = async ({ pageNumber }) => {
    // const token = localStorage.getItem("token");
    const { data } = await axios.get(
        `${BASE_URL}/expenses?page=${pageNumber}`,
        {
            withCredentials: true,
        }
    );
    return data;
};

export const createExpense = async (expenseData) => {
    // const testData = {
    //     amount: 100,
    //     description: 'true'
    // }
    // const token = localStorage.getItem("token");

    const { data } = await axios.post(`${BASE_URL}/expenses/`, newExpense, {
        headers: {
            "Content-Type": "application/json",
        },
        withCredentials: true,
    });
    return data;
};

export const updateExpense = async (expenseData) => {
    const { data } = await axios.patch(
        `${BASE_URL}/expenses/${expenseData.id}/`,
        expenseData,
        {
            headers: {
                "Content-Type": "application/json",
            },
            withCredentials: true,
        }
    );
    return data;
};

export const deleteExpense = async (expenseID) => {
    const { data } = axios.delete(`${BASE_URL}/expenses/${expenseID}/`, {
        withCredentials: true,
    });

    return data;
};
