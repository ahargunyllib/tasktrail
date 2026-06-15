import type { QueryClient } from "@tanstack/react-query";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  useRouter,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import "../styles/globals.css";

export interface RouterAppContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  errorComponent: GlobalError,
  notFoundComponent: NotFound,
});

function NotFound() {
  return (
    <main className="mx-auto max-w-2xl space-y-2 p-6">
      <p className="font-medium text-sm">404 — Page not found</p>
      <p className="text-muted-foreground text-sm">
        The page you're looking for doesn't exist.
      </p>
    </main>
  );
}

function RootComponent() {
  return (
    <>
      <HeadContent />
      <Outlet />
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}

function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  const qeb = useQueryErrorResetBoundary();

  useEffect(() => {
    qeb.reset();
  }, [qeb]);

  return (
    <main className="mx-auto max-w-2xl space-y-4 p-6">
      <p className="text-destructive text-sm">{error.message}</p>
      <Button
        onClick={() => {
          reset();
          router.invalidate();
        }}
        size="sm"
      >
        Retry
      </Button>
    </main>
  );
}
