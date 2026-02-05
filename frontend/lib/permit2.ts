import { ethers } from "ethers";

export const PERMIT2_ADDRESS =
  "0x000000000022D473030F116dDEE9F6B43aC78BA3";

type SignPermit2Args = {
  signer: ethers.Signer;
  token: string;
  amount: ethers.BigNumberish;
  nonce: ethers.BigNumberish;
  deadline: number; // seconds since epoch
  to: string;
  spender: string; // address that will call permitTransferFrom (service)
};

export type Permit2Payload = {
  permit: {
    permitted: { token: string; amount: ethers.BigNumberish };
    nonce: ethers.BigNumberish;
    deadline: ethers.BigNumberish;
  };
  transferDetails: { to: string; requestedAmount: ethers.BigNumberish };
  signature: string;
};

export async function signPermit2Transfer({
  signer,
  token,
  amount,
  nonce,
  deadline,
  to,
  spender,
}: SignPermit2Args): Promise<Permit2Payload> {
  const network = await signer.provider?.getNetwork();
  const chainId = network?.chainId ?? 11155111n; // default to Sepolia

  const domain = {
    name: "Permit2",
    chainId,
    verifyingContract: PERMIT2_ADDRESS,
  };

  const types = {
    TokenPermissions: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    PermitTransferFrom: [
      { name: "permitted", type: "TokenPermissions" },
      { name: "spender", type: "address" },
      { name: "nonce", type: "uint256" },
      { name: "deadline", type: "uint256" },
    ],
  };

  const value = {
    permitted: { token, amount },
    spender,
    nonce,
    deadline,
  };

  const signature = await (signer as any)._signTypedData(domain, types, value);

  return {
    permit: {
      permitted: { token, amount },
      nonce,
      deadline,
    },
    transferDetails: {
      to,
      requestedAmount: amount,
    },
    signature,
  };
}
