import { ethers } from "ethers";

type SignApprovalArgs = {
  signer: ethers.Signer;
  subscriptionId: ethers.BigNumberish;
  amount: ethers.BigNumberish;
  nonce: ethers.BigNumberish;
  expiry: ethers.BigNumberish;
  contractAddress: string;
};

export async function signApproval({
  signer,
  subscriptionId,
  amount,
  nonce,
  expiry,
  contractAddress,
}: SignApprovalArgs) {
  const domain = {
    name: "OnchainSubscription",
    version: "1",
    chainId: 11155111, // Sepolia
    verifyingContract: contractAddress,
  };

  const types = {
    PaymentApproval: [
      { name: "subscriptionId", type: "uint256" },
      { name: "amount", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "expiry", type: "uint256" },
    ],
  };

  return await signer._signTypedData(domain, types, {
    subscriptionId,
    amount,
    nonce,
    expiry,
  });
}
