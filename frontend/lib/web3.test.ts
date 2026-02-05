import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getProvider, getSigner, getContract } from "./web3";
import { ONCHAIN_SUBSCRIPTION_ABI } from "./abi";

// Hoisted mock state so vi.mock can access it safely
const { mockSend, mockGetSigner, Web3Provider, Contract } = vi.hoisted(() => {
  const mockSendFn = vi.fn();
  const mockGetSignerFn = vi.fn();

  const MockWeb3Provider = vi.fn(() => ({
    send: mockSendFn,
    getSigner: mockGetSignerFn,
  }));

  const MockContract = vi.fn(
    (address: string, abi: unknown, signerOrProvider: unknown) => ({
      address,
      abi,
      signerOrProvider,
    })
  );

  return {
    mockSend: mockSendFn,
    mockGetSigner: mockGetSignerFn,
    Web3Provider: MockWeb3Provider,
    Contract: MockContract,
  };
});

vi.mock("ethers", () => ({
  ethers: {
    providers: { Web3Provider },
    Contract,
  },
}));

const originalEnv = { ...process.env };
const originalWindow = global.window;

describe("web3 utility", () => {
  beforeEach(() => {
    mockSend.mockReset();
    mockSend.mockResolvedValue([]);
    mockGetSigner.mockReset();
    mockGetSigner.mockReturnValue("signer");
    Web3Provider.mockClear();
    Contract.mockClear();
    process.env = { ...originalEnv, NEXT_PUBLIC_CONTRACT_ADDRESS: "0xabc" };
    global.window = { ethereum: {} } as unknown as Window & typeof globalThis;
  });

  afterEach(() => {
    process.env = originalEnv;
    global.window = originalWindow;
  });

  it("throws if MetaMask is not installed", () => {
    global.window = {} as Window & typeof globalThis;
    expect(() => getProvider()).toThrow("MetaMask not installed");
  });

  it("returns a provider when ethereum is present", () => {
    const provider = getProvider();
    expect(Web3Provider).toHaveBeenCalledWith(global.window.ethereum);
    expect(provider).toBeDefined();
  });

  it("requests accounts and returns signer", async () => {
    const signer = await getSigner();
    expect(mockSend).toHaveBeenCalledWith("eth_requestAccounts", []);
    expect(mockGetSigner).toHaveBeenCalled();
    expect(signer).toBe("signer");
  });

  it("builds contract with provider by default", async () => {
    const contract = await getContract();
    expect(Contract).toHaveBeenCalledWith(
      "0xabc",
      ONCHAIN_SUBSCRIPTION_ABI,
      expect.any(Object)
    );
    expect(contract.address).toBe("0xabc");
    expect(contract.abi).toBe(ONCHAIN_SUBSCRIPTION_ABI);
  });

  it("builds contract with signer when requested", async () => {
    const contract = await getContract(true);
    expect(mockSend).toHaveBeenCalledWith("eth_requestAccounts", []);
    expect(contract.signerOrProvider).toBe("signer");
  });
});
