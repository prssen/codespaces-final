import { useQuery, useMutation, useQueryClient, QueryClient } from "react-query";
import { useEffect, useState, useContext } from "react";
import Cookies from "js-cookie";
// import axios from "axios";
import { removeEmpties } from "@/lib/utils/utils";
// import { Context } from "../services/context/ContextProvider";
import { Context } from "@/lib/context/ContextProvider";
import { LensTwoTone } from "@mui/icons-material";
// axios.defaults.withCredentials = true;

import { axiosInstance as axios } from "@/lib/api/axiosInstance";

const setCookie = (tokenValue) => {
    Cookies.set('token', tokenValue, { 
        expires: 1,
        sameSite: 'none',
        secure: true
    })
};

// console.log('Axios instance is: ', axios);

// TODO: move these to api.js folder
// TODO: create separate method to get base url/initialise axios
const get = async (url, params) => {
    console.log('Get function called with the following params: ',  params);
    try {
        const response = await axios(url, {
            baseURL: "http://localhost:8000/api/v1/",
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            params: params
        });
        // console.log('The axios GET response is: ', response);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const post = async ({ url, data, isFormData }) => {
    try {
        const response = await axios(url, {
            baseURL: "http://localhost:8000/api/v1/",
            method: "POST",
            data: data,
            headers: {
                "Content-Type": isFormData
                    ? "multipart/form-data"
                    : "application/json",
            },
        });
        // console.log('The axios POST response is: ', response);
        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const patch = async ({url, data, params}) => {
    try {
        const response = await axios(url, {
            baseURL: "http://localhost:8000/api/v1/",
            method: "PATCH",
            data: data,
            headers: {
                "Content-Type": "application/json",
            },
            params: params,
        })
    } catch(error) {
        console.error(error);
        throw error;
    }
}

// TODO: design this to reomve code duplication

// export const useAPIQuery = (route, lookupField, queryParams) =>
//     useQuery(["home"], () => get(`home/`), {
//         onSuccess: (data) => console.log("Home page data: ", data),
//         onError: (error) => console.error(error),
//     });

/*
    N.B. use 'values', rather than { username, password}, as this
    is the form data object returned by useForm hook (lets us change
    structure of login data in one place only - the hook)
*/
// export const useAccountingLogin = (values, onClose) => {
//     const { state, dispatch } = useContext(Context);
//     const queryClient = useQueryClient();

//     return useMutation(
//         async () => post({ url: `accounting_login/`, { 
//             username: values.username,
//             password: values.password
//         } }),
//         {
//             onSuccess: (data) => {
//                 console.log("Successfully logged in: ", data);
//                 queryClient.invalidateQueries(["charity"]);
//                 onClose && onClose();
//             },
//             onError: (error) => {
//                 console.error(error);
//             },
//         }
//     )
// }

// export const useRefetchAll = () => {
//     // Refetch all data on the page by clearing the query cache
//     const queryClient = useQueryClient();
//     queryClient.clear();
//     // return queryClient.refetchQueries({ active: true });
// }

export const useAccountingRegister = (values, callback) => 
    BaseRegister('accounting_register/', values, callback);
export const useTrackerRegister = (values, callback) =>
    BaseRegister('tracker_register/', values, callback)

export const BaseRegister = (url, values, callback) => 
    useMutation(
        async () => post({ url, data: {
            username: values.username,
            password1: values.password,
            password2: values.confirmPassword
        }}),
        {
            onSuccess: (data) => {
                // Store the user data in the query client
                console.log(
                    "Successfully registered with " + url.includes('tracker') ? 'tracker' : 'accounting system' + ', data: ', 
                    data);
                setCookie(data?.key);
                if (callback) callback(data);
            },
            onError: (error) => {
                console.error(error);
            },
        }
    )

export const useAccountingLogin = (values, callback) => BaseLogin('accounting_login/', values, callback);
export const useTrackerLogin = (values, callback) => BaseLogin('tracker_login/', values, callback);

export const BaseLogin = (url, values, callback) => {
    const { state, dispatch } = useContext(Context);
    const queryClient = useQueryClient();

    console.log('Login is called with values: ', values);

    return useMutation(
        // async () => {
        //     const response = await axios.post(
        //         "http://localhost:8000/dj-rest-auth/login/",
        //         {
        //             username: values.username,
        //             password: values.password,
        //         },
        //         {
        //             "Content-Type": "application/json",
        //         }
        //     );
        //     return response.data;
        // },
        async () => post({ url, data: {
            username: values.username,
            password: values.password
        }}),
        {
            onSuccess: (data) => {
                // Store the user data in the query client
                console.log("Saved data: ", data);
                // Store data in secure cookie
                setCookie(data.key);
                queryClient.setQueryData("user", data);
                dispatch({ type: "LOGIN", payload: null });
                dispatch({ type: "FIRST_LOGIN", payload: null});
                // Clear the form fields
                console.log("Successfully logged in to " + url.includes('tracker') ? 'tracker' : 'accounting system');
                // Close the dialog
                console.log(callback ?? 'No callback present');
                if (callback) callback(data);
            },
            onError: (error) => {
                // Log the error or show an error message to the user
                console.error(error);
            },
        }
    );
}

export const useLogout = (values, onClose) => {
    const { state, dispatch } = useContext(Context);
    const queryClient = useQueryClient();

    return useMutation(
        async () => {
            const response = await axios.post(
                "http://localhost:8000/dj-rest-auth/logout/",
                // {
                //     username: values.username,
                //     password: values.password,
                // },
                {
                    "Content-Type": "application/json",
                }
            );
            return response.data;
        },
        {
            onSuccess: (data) => {
                // Store the user data in the query client
                console.log("Logged out saved data: ", data);
                // queryClient.setQueryData("user", data);
                // Clear any auth-related user data from query cache
                Cookies.remove('token');
                queryClient.removeQueries('user');
                dispatch({ type: "LOGIN", payload: null });
                // Clear the form fields
                console.log("Successfully logged out!");
                // Close the dialog
                console.log(onClose ?? 'No onClose present');
                if (onClose) onClose();
            },
            onError: (error) => {
                // Log the error or show an error message to the user
                console.log('Failure in logging out');
                console.error(error);
            },
        }
    );
}


export const useGetNotifications = () => {
    
    const { state, dispatch } = useContext(Context);

    console.log('Current state in useGetNotifications: ', state);
    console.log('Is firstLogin !true: ', !state.firstLogin);

    return useQuery(["notifications"], () => get(`notifications/`), {
        onSuccess: (data) => {
            console.log("Notifications received: ", data);
            dispatch({ type: "LOGGED_IN", payload: null });
        },
        onError: (error) => console.error(error),
        staleTime: 5 * 60 * 1000,
        // enabled: false,
        // enabled: state.firstLogin
    });
}


export const notificationSeen = async (queryClient, uuid) => {
    const args = { 
        url: `notifications/${uuid}/`, 
        data: { 'uuid': uuid}
    };
    // const queryClient = useQueryClient();
    await queryClient.fetchQuery(['notifications', 'seen'], () => patch(args));
}
    // useQuery(["notifications"], () => patch(`notifications/`, { isSeen: true }), {
    //     onSuccess: (data) => console.log("Notification updated as seen"),
    //     onError: (error) => console.error(error),
    // });

export const useGetCharity = (uuid) => {
    const url = uuid ? `charities/${uuid}` : 'charities/';
    return useQuery(["charities"], () => get(url), {
        onSuccess: (data) => console.log("Notifications received: ", data),
        onError: (error) => console.error(error),
    })
}

export const useChangeCharity = (uuid) => {
    const queryClient = useQueryClient();
    const { dispatch } = useContext(Context);

    const args = { 
        url: `profile_charities/${uuid}/`, 
        data: { 'selected': true }
    };
    return useQuery(
        ["selectedCharity", uuid], 
        () => patch(args), 
        { 
            onSuccess: () => {
                // Reset the firstLogin flag to false to refetch notifications
                // using useGetNotifications
                dispatch({ type: "FIRST_LOGIN", payload: null });
                // Refetch charity data for newly selected charity
                queryClient.invalidateQueries('charities');
            },
            enabled: !!uuid,
            refetchOnMount: false,
            // staleTime: Infinity,
            // refetchOnWindowFocus: false,
        }
        // { enabled: false }
    )
}

export const useCreateSupplier = (onClose) => {
    // TODO: use Next.js instead
    const csrfToken = Cookies.get("csrftoken");
    const sessionCookie = Cookies.get("sessionid");

    const queryClient = useQueryClient();
    const userData = queryClient.getQueryData("user");

    return useMutation(
        async (supplierData) => {
            try {
                const response = await axios(
                    // "http://127.0.0.1:8000/api/v1/suppliers/",
                    "http://localhost:8000/api/v1/suppliers/",
                    // {
                    // username: values.username,
                    // password: values.password,

                    // },
                    {
                        method: "POST",
                        data: supplierData,
                        headers: {
                            "X-CSRFToken": csrfToken,
                            // Cookie: `sessionid=${sessionCookie}`,
                            // "Content-Type": "application/json",
                            "Content-Type": "multipart/form-data",
                            // "Access-Control-Request-Headers": "Content-Type",
                            // "Access-Control-Request-Method": "POST",
                        },
                        // withCredentials: true,
                        // Origin: "http://localhost:3000",
                    }
                );
                return response.data;
            } catch (error) {
                console.error(error);
            }
        },
        // Adapted from GitHub Copilot suggestion
        {
            onSuccess: (data) => {
                // Store the user data in the query client
                console.log("Saved data: ", data);
                queryClient.setQueryData("user", data);
                // TODO: find out if this works
                queryClient.invalidateQueries(["supplier", data.uuid]);
                // Clear the form fields
                console.log("Successfully logged in!");
                // Close the dialog
                onClose ?? onClose();
            },
            onError: (error) => {
                // Log the error or show an error message to the user
                console.error(error);
            },
        }
    );
};

export const useGetProfile = () =>
    useQuery(["profile"], () => get(`profile/`), {
        onSuccess: (data) => console.log("User profile data: ", data),
        onError: (error) => console.error(error),
    });

export const useCreateCharity = (callback) => {
    const queryClient = useQueryClient();
    return useMutation(async (data) => post({ url: `charities/`, data }), {
        onSuccess: (data) => {
            console.log("Saved data: ", data);
            queryClient.invalidateQueries(["charity"]);
            callback && callback();
        },
        onError: (error) => {
            console.error(error);
        },
    });
};

// TODO: temporary - delete/replace with call to proper AIS home page
export const useGetHome = () =>
    useQuery(["home"], () => get(`home/`), {
        onSuccess: (data) => console.log("Home page data: ", data),
        onError: (error) => console.error(error),
    });

export const useGetProjectSummary = (uuid) =>
    useQuery(["project-summary", uuid], () => get(`project_summary/${uuid}`), {
        onSuccess: (data) => console.log("project summary data: ", data),
        onError: (error) => console.error(error),
    });

export const useGetProject = (uuid,  options) => {
    let url = 'projects/';
    if (uuid) {
        url += uuid;
    }
    // useQuery(["project", uuid], () => get(`projects/${uuid}`), {
    return useQuery(["project", uuid], () => get(url), {
        onSuccess: (data) => console.log("Project detail data: ", data),
        onError: (error) => console.error(error),
        enabled: options ? options.enabled : true
    });
}

export const useGetServices = (projectUUID) =>
    useQuery(["services", projectUUID],() => get(`services/${projectUUID}`), {
        onSuccess: (data) => console.log(`Services retrieved for project ${projectUUID}: `, data),
        onError: (error) => console.error(error),
    });

export const useGetIndicators = (serviceUUID) =>
    useQuery(
        ["indicators", serviceUUID],
        () => get(`services/${serviceUUID}`),
        {
            onSuccess: (data) =>
                console.log(
                    `Indicators retrieved for service ${serviceUUID}: `,
                    data
                ),
            onError: (error) => console.error(error),
        }
    );

export const useCreateActivity = (onClose) => {
    const queryClient = useQueryClient();
    return useMutation(
        async (data) => post({ url: `activities/`, data, isFormData: true }),
        {
            onSuccess: (data) => {
                console.log("Saved data: ", data);
                queryClient.invalidateQueries(["activities"]);
                console.log('Is onClose called? ', onClose);
                onClose ?? onClose();
            },
            onError: (error) => {
                console.error(error);
            },
        }
    );
};

export const useGetSuppliers = () =>
    useQuery(["suppliers"], () => get(`suppliers/`), {
        onSuccess: (data) => console.log("Charity supplier data: ", data),
        onError: (error) => console.error(error),
    });


/**
 * Get donations by a single donor for the donation tracker
 * 
 * @param {uuid} donationUUID 
 * @param {function} callback 
 * @returns 
 */
export const useGetDonation = (donationUUID, callback) => {
    let url = 'donation_history/';
    if (donationUUID) {
        url += donationUUID;
    }
    // return nuseQuery(["donations"], () => get(`donation_history/${donationUUID}`), {
    return useQuery(["donations"], () => get(url), {
        onSuccess: (data) => {
            console.log("Donation data: ", data);
            callback && callback(data);
        },
        onError: (error) => console.error(error),
    });
}

/**
 * Get donations to a given charity for the accounting system
 * 
 * @param {*} donationUUID 
 */
export const useGetDonationAccounting = (donationUUID) => {
    let url = 'donations/';
    if (donationUUID) url += donationUUID;
    return useQuery(["charity_donations"], () => get(url), {
        onSuccess: (data) => console.log("Donation data: ", data),
        onError: (error) => console.error(error),
    });
}

export const useGetDonorStatistics = () => {
    return useQuery(["donor_statistics"], () => get(`donor_statistics/`), {
        onSuccess: (data) => console.log("Donor analytics data retrieved: ", data),
        onError: (error) => console.error(error),
    });
}

export const useGetDonationStatistics = () => {
    return useQuery(["donation_statistics"], () => get(`donation_statistics/`), {
        onSuccess: (data) => console.log("Donation analytics data retrieved: ", data),
        onError: (error) => console.error(error),
    });
}

export const useGetDonors = () => {
    return useQuery(["donors"], () => get('donors'), {
        onSuccess: (data) => console.log("Donor data: ", data),
        onError: (error) => console.error(error),
    })
}

export const useGetExpenses = () =>
    useQuery(["expenses"], () => get(`expenses/`), {
        onSuccess: (data) => console.log("Expense data retrieved: ", data),
        onError: (error) => console.error(error),
    });

export const useGetExpenseStatistics = () =>
    useQuery(["expense_statistics"], () => get(`expense_statistics/`), {
        onSuccess: (data) => console.log("Expense analytics data retrieved: ", data),
        onError: (error) => console.error(error),
    });

// TODO: consider combining args into a single 'callback' argumennt
export const useCreateExpense = ({ callback, onClose }) => {
    const queryClient = useQueryClient();

    return useMutation(
        async (data) => {
            // Preprocess the data
            if (!data.payment_type) {
                // data.payment_type = 0;
                delete data.payment_type;
            }
            console.log('Create expense data:', data);
            return post({ url: `expenses/`, data, isFormData: false });
        },
        {
            onSuccess: (data) => {
                console.log("Saved expense data: ", data);
                queryClient.invalidateQueries(["expenses"]);
                onClose && onClose();
                callback && callback();
            },
            onError: (error) => {
                console.error(error);
            },
        }
    );
};

// export const useGetAppeals = (maxValue) => 
//     useQuery(["appeals"], () => get(`appeals/`, { max: maxValue }), {

/*
queryParams: an object containing URL query parameters as key-value pairs
*/
export const useGetAppeals = (uuid, queryParams) => {
    // Remove any params which are empty strings/undefined
    const filtered = removeEmpties(queryParams);
    let url = 'appeals/';
    if (uuid) {
        url += uuid;
    }
    // return useQuery(["appeals"], () => get(`appeals/${uuid}`, filtered), {
    return useQuery(["appeals"], () => get(url, filtered), {
        onSuccess: (data) => console.log("Charity appeal data: ", data),
        onError: (error) => console.error(error),
        // cacheTime: 300000,
    });
}

// export const useSearchAppeals = (searchString) => {
//     // Add search string as query param if it is provided
//     // Credit: adapted from AI response
//     let url = 'appeals/';
//     if (searchString) {
//         url += `?search=${searchString}`;
//     };
//     console.log('Url passed in: ', url);
//     return useQuery(["searchAppeal", searchString], () => get(url), {
//         onSuccess: (data) => console.log("Appeal search results: ", data),
//         onError: (error) => console.error(error),
//         refetchOnWindowFocus: false,
//         staleTime: 10000,
//     });
// }

export const useSearchAppeals = (urlParams) => {
    let url = 'appeals/';
    // const queryKey = urlParams.get('search') ? ['searchAppeal', urlParams.get('search')] : ['searchAppeal'];
    console.log('Url passed in: ', url);
    console.log('Url params passed in: ', urlParams);
    return useQuery(['searchAppeal', urlParams], () => get(url, urlParams), {
        onSuccess: (data) => console.log("Appeal search results: ", data),
        onError: (error) => console.error(error),
        refetchOnWindowFocus: false,
        // staleTime: 10000,
    });
}

// export const useGetCharities = () => 
//     useQuery(["appeals"], () => get(`charities/`, { max: maxValue }), {
//         onSuccess: (data) => console.log("Charity appeal data: ", data),
//         onError: (error) => console.error(error),
//     });
