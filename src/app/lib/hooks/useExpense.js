import {
    getAllExpenses,
    createExpense,
    getAllExpensesPaginated,
} from "@/api/expenses";
import { useQuery, useQueryClient } from "react-query";

const staleTime = 1000 * 60 * 60 * 2;

export const useGetAllExpenses = () =>
    useQuery(["expenses", username, password], () => getAllExpenses(), {
        staleTime,
    });

export const useGetAllExpensesPaginated = ({ pageNumber }) =>
    useInfiniteQuery(
        "expenses-paginated",
        getAllExpensesPaginated,
        // TODO: this assumes DRF returns a 'nextPage' property to show page number of next page
        // Adjust function for actual DRF output
        { getNextPageParam: (lastPage, pages) => lastPage.nextPage ?? false }
    );

/*
ALL FROM COPILOT
In ListExpenses page, call:
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useExpenses();
// Add a 'load more' button
<button
        onClick={() => fetchNextPage()}
        disabled={!hasNextPage || isFetchingNextPage}
>
        {isFetchingNextPage 
            ? 'Loading more...'
            : hasNextPage
            ? 'Load More'
            : 'Nothing more to load'
        }
</button>        

*/

export const useCreateExpense = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation(createExpense, {
        onSuccess: () => {
            queryClient.invalidateQueries(["expenses"]);
            queryClient.invalidateQueries(["expenses-paginated"]);
        },
    });
    return mutation;
};
/*
    In CreateExpense page, call:
    consst mutation = useCreateExpense({ username, password});
    mutation.mutate({ amount: 100, description: "test" });

    const mutation = useCreateExpense({ username, password });

*/

export const useUpdateExpense = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation(updateExpense, {
        onSuccess: () => {
            queryClient.invalidateQueries(["expenses"]);
            queryClient.invalidateQueries(["expenses-paginated"]);
        },
    });
    return mutation;
};

// export const useGetPhotosByQuery = ({ query }: { query: string }) =>
//   useQuery(query, () => getPhotosByQuery({ query }), {
//     staleTime
//   })

// // Use in component like this:
//   const { data } = useGetPhotosByQuery({ query })
//  const photos = data?.results || data
