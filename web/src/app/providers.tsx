"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { ApiError, SESSION_EXPIRED_CODE } from "@/lib/api/errors";

function handleGlobalError(error: unknown) {
  if (error instanceof ApiError && error.code === SESSION_EXPIRED_CODE) {
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login?reason=expired";
    }
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: (failureCount, error) => {
              if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
                return false;
              }
              return failureCount < 2;
            },
          },
        },
        queryCache: new QueryCache({ onError: handleGlobalError }),
        mutationCache: new MutationCache({ onError: handleGlobalError }),
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
