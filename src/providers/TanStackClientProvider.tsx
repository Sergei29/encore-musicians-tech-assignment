'use client'

import {useState, type PropsWithChildren} from 'react'
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";



const TanStackClientProvider = ({children}:PropsWithChildren) => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export default TanStackClientProvider