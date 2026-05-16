// SPDX-License-Identifier: Apache-2.0
// Wraps the app in Privy's React provider, styled to the Aegis brand.
//
// When VITE_PRIVY_APP_ID is unset (e.g. during local dev or for forks without a Privy
// account), the wrapper degrades to a pass-through so the app still loads and the
// AuthButton component renders a non-functional state.

import { type ReactNode } from "react";
import { PrivyProvider } from "@privy-io/react-auth";

const APP_ID = import.meta.env.VITE_PRIVY_APP_ID as string | undefined;
const CLIENT_ID = import.meta.env.VITE_PRIVY_CLIENT_ID as string | undefined;

export const isPrivyConfigured = (): boolean => Boolean(APP_ID && APP_ID.length > 0);

export const PrivyAppProvider = ({ children }: { children: ReactNode }) => {
  if (!isPrivyConfigured()) {
    return <>{children}</>;
  }

  return (
    <PrivyProvider
      appId={APP_ID as string}
      clientId={CLIENT_ID}
      config={{
        loginMethods: ["email", "wallet", "google", "github"],
        appearance: {
          theme: "dark",
          accentColor: "#3b82f6",
          logo: "/shield.svg",
          showWalletLoginFirst: false,
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "users-without-wallets",
          },
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
};
