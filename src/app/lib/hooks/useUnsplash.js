// // Example hook that uses query defined in api/ to construct
// // a hook
// From https://allegra9.medium.com/how-to-use-unsplash-api-to-get-images-8653af6ec0ac

// import {getPhotosByQuery} from '@/api/unsplash'
// import { useQuery } from 'react-query'

// const staleTime = 1000 * 60 * 60 * 2

// export const useGetPhotosByQuery = ({ query }: { query: string }) =>
//   useQuery(query, () => getPhotosByQuery({ query }), {
//     staleTime
//   })

// // Use in component like this:
//   const { data } = useGetPhotosByQuery({ query })
//  const photos = data?.results || data
