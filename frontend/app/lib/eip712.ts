export const domain = (chainId: number, address: string) => ({
  name: "OnchainSubscription",
  version: "1",
  chainId,
  verifyingContract: address,
});
