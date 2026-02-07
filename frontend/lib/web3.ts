import { ethers } from "ethers";
import { ONCHAIN_SUBSCRIPTION_ABI } from "./abi";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function getProvider() {
  if (!window.ethereum) throw new Error("MetaMask not installed");
  return new ethers.providers.Web3Provider(window.ethereum);
}

export async function getSigner() {
  const provider = getProvider();
  await provider.send("eth_requestAccounts", []);
  return provider.getSigner();
}

export async function getChainTime(provider: ethers.providers.Web3Provider) {
  const block = await provider.getBlock("latest");
  return block.timestamp;
}

export async function getContract(withSigner = false) {
  const provider = getProvider();
  const signer = withSigner ? await getSigner() : provider;

  return new ethers.Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
    ONCHAIN_SUBSCRIPTION_ABI,
    signer
  );
}
