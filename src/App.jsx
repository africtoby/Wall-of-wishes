import React, { useState, useMemo } from "react";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { AnchorProvider, Program } from "@project-serum/anchor";
import idl from "./idl.json";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
  ConnectionProvider,
  WalletProvider,
  useWallet
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton
} from "@solana/wallet-adapter-react-ui";
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter
} from "@solana/wallet-adapter-wallets";

import "@solana/wallet-adapter-react-ui/styles.css";
import "./App.css";

const programID = new PublicKey("EQqZXJWPxpSFjXquzw6ZpqY7J8BU9KvHkN3wkYNUtcW8");
const network = WalletAdapterNetwork.Devnet;

const AppContent = () => {
  const wallet = useWallet();
  const [wish, setWish] = useState("");
  const [txHash, setTxHash] = useState("");

  const connection = new Connection(clusterApiUrl("devnet"));
  const provider = new AnchorProvider(connection, wallet, {
    commitment: "processed"
  });

  const program = new Program(idl, programID, provider);

  const sendWish = async () => {
    if (!wallet.publicKey) return alert("Connect wallet first");
    try {
      const tx = await program.methods.initialize().rpc();
      setTxHash(tx);
    } catch (err) {
      console.error("Transaction failed", err);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "2rem" }}>
      <h1>Wall of Wish</h1>
      <WalletMultiButton />
      <input
        type="text"
        placeholder="Write your wish..."
        value={wish}
        onChange={(e) => setWish(e.target.value)}
        style={{ padding: "0.5rem", marginTop: "1rem", width: "300px" }}
      />
      <br />
      <button onClick={sendWish} style={{ marginTop: "1rem" }}>
        Submit Wish
      </button>
      {txHash && (
        <p>
          Transaction:{" "}
          <a
            href={`https://explorer.solana.com/tx/${txHash}?cluster=devnet`}
            target="_blank"
            rel="noreferrer"
          >
            {txHash}
          </a>
        </p>
      )}
    </div>
  );
};

function App() {
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter(), new TorusWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={clusterApiUrl(network)}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AppContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
