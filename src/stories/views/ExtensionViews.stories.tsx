import React from "react"
import { Meta } from "@storybook/react"
import { MockPopup } from "../../mock/MockApp"
import { BigNumber } from "@ethersproject/bignumber"
import { initBackgroundState } from "../../mock/MockBackgroundState"
import {
    TransactionCategories,
    TransactionStatus,
    MetaType,
} from "../../context/commTypes"
import { parseEther } from "@ethersproject/units"
import { CurrencyAmountPair } from "@blank/background/controllers/blank-deposit/types"
import { DappReq } from "../../context/hooks/useDappRequest"
import { TransactionMeta } from "@blank/background/controllers/transactions/utils/types"

export const Popup = () => (
    <MockPopup
        location={`/home`}
        assignBlankState={initBackgroundState.blankState}
    />
)

export const ErrorPage = () => (
    <MockPopup
        location={`/error`}
        assignBlankState={initBackgroundState.blankState}
    />
)

export const Reminder = () => (
    <MockPopup
        location={`/reminder`}
        state={{
            seedPhrase: "test phrase words random asd",
        }}
        assignBlankState={{
            isOnboarded: true,
            // isAppUnlocked: false,
            isSeedPhraseBackedUp: false,
        }}
    />
)

const generateTx = (i: number) => ({
    id: i.toString(),
    status: TransactionStatus.CONFIRMED,
    time: 100000,
    blocksDropCount: 0,
    transactionParams: {
        origin: "0x0",
        value: parseEther("1.2"),
        from: "0x0",
        to: "0x0",
    },
    loadingGasValues: false,
    origin: "0x0",
    value: parseEther("1.2"),
    from: "0x0",
    to: "0x0",
    transactionCategory: TransactionCategories.SENT_ETHER,
    metaType: MetaType.REGULAR,
})

const mockTxs = [0, 1, 2, 3, 4].map(generateTx)
const mockTxsByHash = mockTxs.reduce((o, tx) => {
    o[tx.id] = tx
    return o
}, {} as any)

export const PopupTransactions = () => (
    <MockPopup
        location="/"
        assignBlankState={{
            depositsCount: {
                eth: [
                    {
                        pair: {
                            currency: "eth",
                            amount: "1",
                        } as CurrencyAmountPair,
                        count: 2,
                    },
                ],
                dai: [
                    {
                        pair: {
                            currency: "dai",
                            amount: "100",
                        } as CurrencyAmountPair,
                        count: 2,
                    },
                ],
                cdai: [
                    {
                        pair: {
                            currency: "cdai",
                            amount: "5000",
                        } as CurrencyAmountPair,
                        count: 2,
                    },
                ],
                usdc: [
                    {
                        pair: {
                            currency: "usdc",
                            amount: "100",
                        } as CurrencyAmountPair,
                        count: 2,
                    },
                ],
                usdt: [
                    {
                        pair: {
                            currency: "usdt",
                            amount: "100",
                        } as CurrencyAmountPair,
                        count: 2,
                    },
                ],
                wbtc: [
                    {
                        pair: {
                            currency: "wbtc",
                            amount: "0.1",
                        } as CurrencyAmountPair,
                        count: 2,
                    },
                ],
            },
            transactions: mockTxs,
            incomingTransactions: {
                "0x0": {
                    goerli: { lastBlockQueried: 500, list: mockTxsByHash },
                    mainnet: { lastBlockQueried: 500, list: {} },
                    arbitrum: { lastBlockQueried: 500, list: {} },
                    optimism: { lastBlockQueried: 500, list: {} },
                    bsc: { lastBlockQueried: 500, list: {} },
                    polygon: { lastBlockQueried: 500, list: {} },
                    avalancheC: { lastBlockQueried: 500, list: {} },
                    bsc_testnet: { lastBlockQueried: 500, list: {} },
                    kovan: { lastBlockQueried: 500, list: {} },
                    ropsten: { lastBlockQueried: 500, list: {} },
                    rinkeby: { lastBlockQueried: 500, list: {} },
                    localhost: { lastBlockQueried: 500, list: {} },
                },
            },
        }}
    />
)

export const Sign = () => (
    <MockPopup
        location={`/sign`}
        assignBlankState={initBackgroundState.blankState}
    />
)

export const Connect = () => (
    <MockPopup
        location={`/connect`}
        assignBlankState={{
            ...initBackgroundState.blankState,
            permissionRequests: {
                "1": {
                    origin: "https://app.uniswap.org/",
                    originId: "1",
                    siteMetadata: {
                        iconURL:
                            "https://cryptologos.cc/logos/uniswap-uni-logo.png?v=010",
                        name: "Uniswap",
                    },
                    time: 0,
                },
                "2": {
                    origin: "https://app.1inch.io",
                    originId: "1",
                    siteMetadata: {
                        iconURL:
                            "https://raw.githubusercontent.com/trustwallet/assets/master/dapps/1inch.exchange.png",
                        name: "1inch",
                    },
                    time: 1,
                },
            },
        }}
    />
)

export const TransactionConfirm = () => (
    <MockPopup
        location={`/transaction/confirm`}
        assignBlankState={{
            ...initBackgroundState.blankState,
            unapprovedTransactions: {
                "1": {
                    id: "1",
                    status: "UNAPPROVED" as TransactionStatus,
                    time: 1234,
                    origin: "https://app.uniswap.org",
                    transactionCategory: "contractInteraction" as TransactionCategories,
                    methodSignature: {
                        args: [
                            {
                                type: "uint256",
                            },
                            {
                                type: "address[]",
                            },
                            {
                                type: "address",
                            },
                            {
                                type: "uint256",
                            },
                        ],
                        name: "Swap Exact E T H For Tokens",
                    },
                    transactionParams: {
                        value: BigNumber.from("0x056bc75e2d63100000"),
                        from: "0xd7Fd7EDcb7376c490b0e45e391e8040928F73081",
                        to: "0xe592427a0aece92de3edee1f18e0157c05861564",
                        gasLimit: {
                            _hex: "0x024acb",
                            _isBigNumber: true,
                        } as BigNumber,
                        gasPrice: BigNumber.from(111111111110),

                        maxPriorityFeePerGas: BigNumber.from(111111111110),
                        maxFeePerGas: BigNumber.from(111111111110),
                    },
                    loadingGasValues: false,
                    gasEstimationFailed: true,
                    blocksDropCount: 0,
                    metaType: MetaType.REGULAR,
                },
                "2": {
                    id: "1",
                    status: "UNAPPROVED" as TransactionStatus,
                    time: 1234,
                    origin: "https://app.uniswap.org",
                    transactionCategory: "contractInteraction" as TransactionCategories,
                    methodSignature: {
                        args: [
                            {
                                type: "uint256",
                            },
                            {
                                type: "address[]",
                            },
                            {
                                type: "address",
                            },
                            {
                                type: "uint256",
                            },
                        ],
                        name: "Swap Exact E T H For Tokens",
                    },
                    transactionParams: {
                        value: {
                            _hex: "0x2386f26fc10000",
                            _isBigNumber: true,
                        } as BigNumber,
                        from: "0xd7Fd7EDcb7376c490b0e45e391e8040928F73081",
                        to: "0xe592427a0aece92de3edee1f18e0157c05861564",
                        gasLimit: {
                            _hex: "0x024acb",
                            _isBigNumber: true,
                        } as BigNumber,
                        gasPrice: {
                            _hex: "0xe8d4a51000",
                            _isBigNumber: true,
                        } as BigNumber,
                        maxPriorityFeePerGas: {
                            _hex: "0x3b9aca00",
                            _isBigNumber: true,
                        } as BigNumber,
                        maxFeePerGas: {
                            _hex: "0x02540be400",
                            _isBigNumber: true,
                        } as BigNumber,
                    },
                    loadingGasValues: false,
                    blocksDropCount: 0,
                    metaType: MetaType.REGULAR,
                },
            },
        }}
    />
)

export const Settings = () => <MockPopup location={`/settings`} />
export const LockTimeOut = () => (
    <MockPopup location={`/settings/lockTimeout`} />
)

export const SwitchEthereumChain = () => (
    <MockPopup
        location="/chain/switch"
        assignBlankState={{
            dappRequests: {
                "1": {
                    origin: "http://app.blockwallet.io/",
                    siteMetadata: {
                        name: "BlockWallet",
                        iconURL: "http://app.blockwallet.io/icons/icon-128.png",
                    },
                    time: 1,
                    type: DappReq.SWITCH_NETWORK,
                    params: {
                        chainId: 56,
                    },
                    originId: "1",
                },
            },
        }}
    />
)

export const UnlockPage = () => (
    <MockPopup
        location={`/unlock`}
        state={{}}
        assignBlankState={{
            isOnboarded: true,
            isAppUnlocked: false,
            isSeedPhraseBackedUp: false,
        }}
    />
)

export default { title: "Extension Views" } as Meta
