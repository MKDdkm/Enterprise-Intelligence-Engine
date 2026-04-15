/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly NEXT_PUBLIC_RPC_URL?: string;
	readonly NEXT_PUBLIC_CHAIN_ID?: string;
	readonly NEXT_PUBLIC_CONTRACT_ADDRESS?: string;
	readonly VITE_CONTRACT_ADDRESS?: string;
	readonly VITE_API_BASE_URL?: string;
	readonly VITE_BLOCK_EXPLORER_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
