import { BigNumber } from "ethers"

export const SEND_GAS_COST = BigNumber.from("0x5208") // Hex for 21000, cost of a simple send.
export const DEPOSIT_GAS_COST = BigNumber.from("0x124f80") // Hex for 12e5, cost of deposit.
export const APPROVE_GAS_COST = BigNumber.from("0xcb34") // Hex for 52020, default cost of approve.

/**
 * Decimal places to default in case an error looking up for them occurred
 */
export const DEFAULT_DECIMALS = 18

export const LINKS = {
    TELEGRAM: "https://t.me/blockwallet",
    GITHUB: "https://github.com/block-wallet/",
    TWITTER: "https://twitter.com/BlockWallet",
}
