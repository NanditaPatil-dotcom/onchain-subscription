"use client";

import { useState } from "react";
import { getSigner } from "@/lib/web3";

export function Navbar() {
  const [address, setAddress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function connectWallet() {
    try {
      // Catch the common case where MetaMask isn't available and surface it to the user.
      if (typeof window === "undefined" || !window.ethereum) {
        setError("MetaMask is not installed. Please install it to connect your wallet.");
        return;
      }

      setError(null);
      const signer = await getSigner();
      const addr = await signer.getAddress();
      // Helpful for local debugging: prints the full address in the browser console
      // so you can confirm which wallet/account is connected.
      console.log("Connected wallet address:", addr);
      setAddress(addr);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect wallet";
      setError(message);
    }
  }

  return (
    <nav className="relative z-20 border-b border-purple-500/20 bg-black/30 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between">

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm text-purple-200 hover:text-purple-100 transition">
              Docs
            </a>
            <a href="#" className="text-sm text-purple-200 hover:text-purple-100 transition">
              About
            </a>
            <a href="#" className="text-sm text-purple-200 hover:text-purple-100 transition">
              Pricing
            </a>
          </div>

          {/* Connect Wallet Button */}
          <button
            onClick={connectWallet}
            className="px-4 py-2 rounded-full bg-purple-600 text-white text-sm font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all"
          >
            {address ? `${address.slice(0, 6)}...` : "Connect Wallet"}
          </button>
        </div>
      </div>
      {error && (
        <div className="pointer-events-auto fixed right-4 top-20 z-40 max-w-sm rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100 shadow-xl shadow-red-900/30 backdrop-blur">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-red-400" aria-hidden />
            <div className="flex-1">
              <p className="font-semibold text-red-200">MetaMask required</p>
              <p className="text-red-100/90">{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="ml-2 text-red-200/80 transition hover:text-red-100"
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
