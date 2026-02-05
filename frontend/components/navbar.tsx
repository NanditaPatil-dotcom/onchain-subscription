"use client";

import { useState } from "react";
import { getSigner } from "@/lib/web3";

export function Navbar() {
  const [address, setAddress] = useState<string | null>(null);

  async function connectWallet() {
    const signer = await getSigner();
    const addr = await signer.getAddress();
    // Helpful for local debugging: prints the full address in the browser console
    // so you can confirm which wallet/account is connected.
    console.log("Connected wallet address:", addr);
    setAddress(addr);
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
    </nav>
  );
}
