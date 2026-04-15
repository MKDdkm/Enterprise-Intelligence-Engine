import { BrowserProvider } from "ethers";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] | object }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function hasEthereumProvider() {
  return typeof window !== "undefined" && Boolean(window.ethereum);
}

export function getExpectedChainIdHex() {
  const configured = import.meta.env.NEXT_PUBLIC_CHAIN_ID?.trim();
  if (!configured) {
    return null;
  }

  const parsed = Number(configured);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return `0x${parsed.toString(16)}`;
}

export async function connectWallet() {
  if (!hasEthereumProvider()) {
    throw new Error("MetaMask is not installed.");
  }

  const provider = new BrowserProvider(window.ethereum as never);
  const network = await provider.getNetwork();
  const chainIdHex = `0x${network.chainId.toString(16)}`;
  const expectedChainIdHex = getExpectedChainIdHex();

  if (expectedChainIdHex && chainIdHex.toLowerCase() !== expectedChainIdHex.toLowerCase()) {
    throw new Error(`Wrong network. Please switch to chain ${expectedChainIdHex}.`);
  }

  const accounts = (await (window.ethereum as EthereumProvider).request({
    method: "eth_requestAccounts",
  })) as string[];

  if (!accounts?.[0]) {
    throw new Error("No wallet account available.");
  }

  return {
    account: accounts[0],
    chainIdHex,
  };
}

export async function storeEvidenceCidOnChain(cid: string) {
  const contractAddress = (import.meta.env.NEXT_PUBLIC_CONTRACT_ADDRESS || import.meta.env.VITE_CONTRACT_ADDRESS || "").trim();

  if (!contractAddress) {
    return null;
  }

  if (!hasEthereumProvider()) {
    throw new Error("MetaMask is not installed.");
  }

  const provider = new BrowserProvider(window.ethereum as never);
  const signer = await provider.getSigner();

  const abi = [
    "function storeEvidenceCID(string cid) external returns (bool)",
    "function storeEvidenceCid(string cid) external returns (bool)",
    "function addEvidence(string cid) external returns (bool)",
    "function addEvidenceCID(string cid) external returns (bool)",
  ];
  const { Contract } = await import("ethers");
  const contract = new Contract(contractAddress, abi, signer);

  const candidateMethods = ["storeEvidenceCID", "storeEvidenceCid", "addEvidence", "addEvidenceCID"] as const;
  let txHash = "";

  for (const method of candidateMethods) {
    try {
      const tx = await (contract as Record<string, (arg: string) => Promise<{ hash: string; wait: () => Promise<{ hash?: string }> }>>)[method](cid);
      // Capture tx hash immediately, before waiting for confirmation
      txHash = tx.hash;
      console.log(`[storeEvidenceCidOnChain] Method '${method}' succeeded. TX hash: ${txHash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      if (receipt) {
        console.log(`[storeEvidenceCidOnChain] TX confirmed. Receipt hash: ${receipt.hash}`);
      }
      break;
    } catch (error) {
      console.log(`[storeEvidenceCidOnChain] Method '${method}' failed:`, error instanceof Error ? error.message : error);
      // Continue trying other common function names.
    }
  }

  if (!txHash) {
    throw new Error("Contract write failed. Expected one of: storeEvidenceCID, storeEvidenceCid, addEvidence, addEvidenceCID.");
  }

  return txHash;
}
