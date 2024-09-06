// import { useCallback } from "react"

// // Get a new searchParams string by merging the current
// // searchParams with a provided key/value pair

// // Credit: https://nextjs.org/docs/app/api-reference/functions/use-search-params#updating-searchparams 
// export const useCreateQueryString = useCallback(
//     (name, value) => {
//       const params = new URLSearchParams(searchParams.toString())
//       params.set(name, value)
 
//       return params.toString()
//     },
//     [searchParams]
//   )