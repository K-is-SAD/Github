"use client";

import { createThirdwebClient } from "thirdweb";
import { ConnectButton } from "thirdweb/react";
import { darkTheme } from "thirdweb/react";
import {
  inAppWallet,
  createWallet,
} from "thirdweb/wallets";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
});

const wallets = [
  inAppWallet({
    auth: {
      options: [
        "google",
        "email",
        "x",
        "passkey",
        "phone",
        "github",
        "guest",
      ],
    },
  }),
  createWallet("com.coinbase.wallet"),
  createWallet("io.zerion.wallet"),
  createWallet("io.metamask"),
];

export function ConnectWallet() {
  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      theme={darkTheme({
        colors: {
          modalBg: "hsl(230, 67%, 4%)",
          borderColor: "hsl(0, 16%, 77%)",
          accentText: "hsl(152, 100%, 60%)",
          separatorLine: "hsl(58, 88%, 51%)",
        },
      })}
      connectModal={{ size: "compact" }}
    />
  );
}