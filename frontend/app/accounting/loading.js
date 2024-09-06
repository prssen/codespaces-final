"use client"

// TODO: UI to display when any accounting/ route is loading
import Loading from "@/components/Loading"

// export default Loading() { 
//     return (
//         <LoadingSkeleton />
//     );
// }

export default function LoadingComponent() {
    return <Loading open={true}/>
}