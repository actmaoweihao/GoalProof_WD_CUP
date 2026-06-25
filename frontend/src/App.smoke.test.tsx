import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { describe, expect, it } from "vitest";
import App from "./App";
import { wagmiConfig } from "./config/wagmi";

describe("App smoke", () => {
  it("renders the shell without crashing", async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <App />
          </MemoryRouter>
        </QueryClientProvider>
      </WagmiProvider>
    );

    expect(await screen.findByRole("heading", { name: /先证明你猜过/ })).toBeInTheDocument();
  });
});
