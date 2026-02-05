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

  const typedSigner = signer as unknown as {
    _signTypedData: (
      domain: any,
      types: Record<string, Array<{ name: string; type: string }>>,
      value: Record<string, any>
    ) => Promise<string>;
  };

  return await typedSigner._signTypedData(domain, types, {
    subscriptionId,
    amount,
    nonce,
    expiry,
  });
}
