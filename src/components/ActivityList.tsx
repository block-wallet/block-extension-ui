import React, { FunctionComponent, useState, useRef, useEffect } from "react"
import { FaExchangeAlt } from "react-icons/fa"
import { FiUpload } from "react-icons/fi"
import { RiCopperCoinFill } from "react-icons/ri"
import { AiFillInfoCircle } from "react-icons/ai"
import { ImSpinner } from "react-icons/im"
import { ContextMenuTrigger, ContextMenu, MenuItem } from "react-contextmenu"
import { BigNumber } from "ethers"
import classNames from "classnames"

// Styles
import { Classes, classnames } from "../styles"

// Components
import ComplianceMenu from "../components/withdraw/ComplianceMenu"
import { AssetIcon } from "./AssetsList"
import Tooltip from "../components/label/Tooltip"

// Asset
import eth from "../assets/images/icons/ETH.svg"
import blankLogo from "../assets/images/logo.svg"
import dotLoading from "../assets/images/icons/dot_loading.svg"
import flashbotsLogo from "../assets/images/flashbots.png"

// Context
import { useBlankState } from "../context/background/backgroundHooks"
import { TransactionCategories, TransactionStatus } from "../context/commTypes"
import {
    TransactionMeta,
    TransferType,
} from "@blank/background/controllers/transactions/utils/types"

// Utils
import { formatCurrency, toCurrencyAmount } from "../util/formatCurrency"
import { generateExplorerLink } from "../util/getExplorer"
import { capitalize } from "../util/capitalize"
import { getDisplayTime } from "../util/getDisplayTime"
import formatTransactionValue from "../util/formatTransactionValue"
import { useSelectedNetwork } from "../context/hooks/useSelectedNetwork"
import AppIcon from "./icons/AppIcon"
import { useSelectedAccount } from "../context/hooks/useSelectedAccount"
import {
    flagQueuedTransactions,
    RichedTransactionMeta,
} from "../util/transactionUtils"

const transactionMessages = {
    [TransactionCategories.BLANK_DEPOSIT]: "Privacy Pool Deposit",
    [TransactionCategories.BLANK_WITHDRAWAL]: "Privacy Pool Withdraw",
    [TransactionCategories.INCOMING]: "Received Ether",
    [TransactionCategories.SENT_ETHER]: "Sent Ether",
    [TransactionCategories.CONTRACT_DEPLOYMENT]: "Deploy Contract",
    [TransactionCategories.CONTRACT_INTERACTION]: "Contract Interaction",
    [TransactionCategories.TOKEN_METHOD_APPROVE]: "Token Approval",
    [TransactionCategories.TOKEN_METHOD_TRANSFER]: "Token Transfer",
    [TransactionCategories.TOKEN_METHOD_TRANSFER_FROM]: "Token Transfer From",
    [TransactionCategories.BLANK_SWAP]: "Blank Swap",
}

const pendingTransactionMessages: { [x: string]: string } = {
    [TransactionCategories.CONTRACT_DEPLOYMENT]: "Deploying Contract",
    [TransactionCategories.TOKEN_METHOD_APPROVE]: "Approving Tokens",
    [TransactionCategories.TOKEN_METHOD_TRANSFER]: "Transfering Tokens",
}

const getTransactionMessage = (
    category: TransactionCategories,
    symbol: string
) => {
    switch (category) {
        case TransactionCategories.SENT_ETHER:
            return `Sent ${symbol}`
        case TransactionCategories.INCOMING:
            return `Received ${symbol}`
        default:
            return transactionMessages[category]
    }
}

const getPendingTransactionMessage = (
    category: TransactionCategories,
    symbol: string
) => {
    switch (category) {
        case TransactionCategories.SENT_ETHER:
            return `Sending ${symbol}`
        default:
            return pendingTransactionMessages[category]
    }
}

const transactionIcons = {
    [TransactionCategories.BLANK_DEPOSIT]: <img src={blankLogo} alt="blank" />,
    [TransactionCategories.BLANK_WITHDRAWAL]: (
        <img src={blankLogo} alt="blank" />
    ),
    [TransactionCategories.INCOMING]: <img src={eth} alt="ETH" />,
    [TransactionCategories.SENT_ETHER]: <img src={eth} alt="ETH" />,
    [TransactionCategories.CONTRACT_DEPLOYMENT]: <FiUpload />,
    [TransactionCategories.CONTRACT_INTERACTION]: <FaExchangeAlt />,
    [TransactionCategories.TOKEN_METHOD_APPROVE]: (
        <RiCopperCoinFill size="1.5rem" />
    ),
    [TransactionCategories.TOKEN_METHOD_TRANSFER]: (
        <RiCopperCoinFill size="1.5rem" />
    ),
    [TransactionCategories.TOKEN_METHOD_TRANSFER_FROM]: (
        <RiCopperCoinFill size="1.5rem" />
    ),
    [TransactionCategories.BLANK_SWAP]: <RiCopperCoinFill size="1.5rem" />,
}

const failedStatuses = [
    TransactionStatus.FAILED,
    TransactionStatus.CANCELLED,
    TransactionStatus.DROPPED,
    TransactionStatus.REJECTED,
]

const PendingSpinner: FunctionComponent<{
    size?: string
}> = ({ size = "1rem" }) => (
    <ImSpinner size={size} className="animate-spin text-black opacity-50" />
)

const TransactionIcon: FunctionComponent<{
    transaction: {
        transactionCategory: TransactionCategories | undefined
        transactionStatus: TransactionStatus
    }
    transactionIcon?: string
}> = ({
    transaction: { transactionCategory: category, transactionStatus },
    transactionIcon,
}) => (
    <div className="align-start">
        {transactionStatus !== TransactionStatus.SUBMITTED ? (
            transactionIcon ? (
                <AssetIcon
                    asset={{
                        logo: transactionIcon,
                        symbol: "",
                    }}
                />
            ) : category ? (
                <div className={Classes.roundedIcon}>
                    {transactionIcons[category]}
                </div>
            ) : null
        ) : (
            <div className={Classes.roundedIcon}>
                <PendingSpinner />
            </div>
        )}
    </div>
)

const getTransactionTime = (
    status: TransactionStatus,
    time: number,
    pendingIndex: number,
    isQueued: boolean
) => {
    const { color, label } =
        status === TransactionStatus.SUBMITTED
            ? !isQueued
                ? { color: "text-gray-600", label: "Pending..." }
                : { color: "text-yellow-600", label: "Queued" }
            : {
                  color: "text-gray-600",
                  label: getDisplayTime(new Date(time)),
              }

    return <span className={`text-xs ${color}`}>{label}</span>
}

const getTransactionLabel = (
    status: TransactionStatus,
    pendingIndex: number | undefined,
    transactionCategory: TransactionCategories | undefined,
    methodSignature: TransactionMeta["methodSignature"],
    networkNativeCurrency: { symbol: string }
): string => {
    const getCategoryMessage = () => {
        const isPending =
            status === TransactionStatus.SUBMITTED && pendingIndex === 0

        if (!transactionCategory) {
            return "Transaction"
        }

        return isPending
            ? getPendingTransactionMessage(
                  transactionCategory,
                  networkNativeCurrency.symbol
              ) ||
                  getTransactionMessage(
                      transactionCategory,
                      networkNativeCurrency.symbol
                  )
            : getTransactionMessage(
                  transactionCategory,
                  networkNativeCurrency.symbol
              )
    }

    const defaultCategory = getCategoryMessage()

    if (transactionCategory === TransactionCategories.CONTRACT_INTERACTION) {
        return methodSignature ? methodSignature.name : defaultCategory
    }

    return defaultCategory
}

const getTransactionTimeOrStatus = (
    status: TransactionStatus,
    confirmationTime: number | undefined,
    submittedTime: number | undefined,
    time: number,
    index: number,
    isQueued: boolean
) => {
    if (failedStatuses.includes(status)) {
        return (
            <span className="text-xs text-red-600">
                {capitalize(status.toLowerCase())}
            </span>
        )
    } else {
        return getTransactionTime(
            status,
            confirmationTime || submittedTime || time,
            index,
            isQueued
        )
    }
}

const Transaction: FunctionComponent<{
    transaction: RichedTransactionMeta
    index: number
}> = ({
    index,
    transaction: {
        transactionParams: { value, hash },
        transactionCategory,
        methodSignature,
        status,
        time,
        confirmationTime,
        submittedTime,
        transferType,
        id,
        flashbots,
        isQueued,
    },
}) => {
    const state = useBlankState()!
    const {
        nativeCurrency: networkNativeCurrency,
        defaultNetworkLogo,
    } = useSelectedNetwork()

    const txHash = hash
    const transfer = transferType ?? {
        amount: value ? value : BigNumber.from("0"),
        currency: networkNativeCurrency.symbol,
        decimals: networkNativeCurrency.decimals,
        logo: defaultNetworkLogo,
    }
    const isBlankWithdraw: boolean =
        transactionCategory === "blankWithdrawal" ? true : false
    const blankWithdrawId: string = id

    const label = getTransactionLabel(
        status,
        index,
        transactionCategory,
        methodSignature,
        networkNativeCurrency
    )

    const txValue = transfer.amount
        ? formatTransactionValue(transfer as TransferType, true, 5)[0]
        : ""

    const [methodWidth, valueWidth] =
        txValue.length <= 5 ? ["w-4/6", "w-2/6"] : ["w-7/12", "w-5/12"]

    return (
        <>
            <ContextMenuTrigger id={`${index}`}>
                <a
                    href={
                        txHash
                            ? generateExplorerLink(
                                  state.availableNetworks,
                                  state.selectedNetwork,
                                  txHash,
                                  "tx"
                              )
                            : "#"
                    }
                    target={txHash && "_blank"}
                    className={`flex flex-row justify-between items-center px-6 py-5 -ml-6 transition duration-300 hover:bg-primary-100 hover:bg-opacity-50 active:bg-primary-200 active:bg-opacity-50 ${
                        !txHash ? "cursor-default" : ""
                    }`}
                    style={{ width: "calc(100% + 2 * 1.5rem)" }}
                    onClick={(e) => {
                        if (!!txHash) return

                        e.preventDefault()
                    }}
                >
                    {/* Type */}
                    <div
                        className={classNames(
                            "flex flex-row items-center",
                            !transfer.amount ? "w-5/6" : methodWidth
                        )}
                    >
                        <TransactionIcon
                            transaction={{
                                transactionCategory,
                                transactionStatus: status,
                            }}
                            transactionIcon={transfer.logo}
                        />
                        <div
                            className="flex flex-col ml-2"
                            style={{ width: "calc(100% - 3.5rem)" }}
                        >
                            <div className="flex flex-row w-full items-center space-x-1">
                                <span
                                    className="text-sm font-bold truncate"
                                    title={label}
                                >
                                    {label}
                                </span>
                                {flashbots && (
                                    <AppIcon
                                        iconURL={flashbotsLogo}
                                        size={6}
                                        iconSize={5}
                                        title="Flashbots"
                                    />
                                )}
                                {status === TransactionStatus.DROPPED && (
                                    <div className="group relative self-start">
                                        <a
                                            href="https://help.goblank.io/hc/en-us/articles/4410031249553"
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <AiFillInfoCircle
                                                size={24}
                                                className="pl-2 pb-1 text-primary-200 cursor-pointer hover:text-primary-300"
                                            />
                                        </a>
                                        <Tooltip
                                            content={
                                                <div className="flex flex-col font-normal items-start text-xs text-white-500">
                                                    <div className="flex flex-row items-end space-x-7">
                                                        <span>
                                                            This transaction was
                                                            never mined.
                                                        </span>{" "}
                                                    </div>
                                                    <div className="flex flex-row items-end space-x-4">
                                                        <span>
                                                            Click on this icon
                                                            to learn more.
                                                        </span>{" "}
                                                    </div>
                                                </div>
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                            {getTransactionTimeOrStatus(
                                status,
                                confirmationTime,
                                submittedTime,
                                time,
                                index,
                                isQueued || false
                            )}
                        </div>
                    </div>

                    {/* Amount */}
                    {transfer.amount && (
                        <div
                            className={classNames(
                                "flex flex-col items-end",
                                valueWidth
                            )}
                        >
                            <div className="w-full flex justify-end">
                                <span
                                    className="text-sm font-bold text-right truncate w-4/6 mr-1"
                                    title={formatTransactionValue(
                                        transfer as TransferType
                                    ).reduce(
                                        (acc, curr) => `${acc} ${curr}`,
                                        ""
                                    )}
                                >
                                    {(() => {
                                        switch (transactionCategory) {
                                            case TransactionCategories.INCOMING:
                                            case TransactionCategories.BLANK_WITHDRAWAL:
                                                return "+"

                                            default:
                                                return BigNumber.from(
                                                    transfer.amount
                                                ).gte(0)
                                                    ? ""
                                                    : "-"
                                        }
                                    })()}
                                    {txValue}
                                </span>
                                <span className="text-sm font-bold text-right">
                                    {transfer.currency.toUpperCase()}
                                </span>
                            </div>
                            <div className="w-full flex justify-end">
                                <span
                                    className="text-xs text-gray-600 truncate w-5/6 text-right mr-1"
                                    title={formatCurrency(
                                        toCurrencyAmount(
                                            transfer.amount,
                                            state.exchangeRates[
                                                transfer.currency.toUpperCase()
                                            ],
                                            transfer.decimals
                                        ),
                                        {
                                            currency: state.nativeCurrency,
                                            locale_info: state.localeInfo,
                                            returnNonBreakingSpace: true,
                                            showSymbol: true,
                                        }
                                    )}
                                >
                                    {formatCurrency(
                                        toCurrencyAmount(
                                            transfer.amount,
                                            state.exchangeRates[
                                                transfer.currency.toUpperCase()
                                            ],
                                            transfer.decimals
                                        ),
                                        {
                                            currency: state.nativeCurrency,
                                            locale_info: state.localeInfo,
                                            returnNonBreakingSpace: true,
                                            showSymbol: true,
                                            showCurrency: false,
                                        }
                                    )}
                                </span>
                                <span className="text-xs text-gray-600 text-right">
                                    {state.nativeCurrency.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    )}
                </a>
            </ContextMenuTrigger>

            {/* Compliance Menu */}
            {isBlankWithdraw ? (
                status !== TransactionStatus.SUBMITTED ? (
                    <ContextMenu
                        id={`${index}`}
                        hideOnLeave={true}
                        preventHideOnContextMenu={true}
                        className="z-50"
                    >
                        <MenuItem className="w-48 ml-4 mr-4">
                            <ComplianceMenu
                                withdrawId={blankWithdrawId}
                                active={true}
                            />
                        </MenuItem>
                    </ContextMenu>
                ) : null
            ) : null}
        </>
    )
}

const ActivityList = () => {
    const { chainId } = useSelectedNetwork()
    const { address } = useSelectedAccount()
    const { confirmed, pending } = useBlankState()!.activityList

    const getInitialCount = () =>
        confirmed.length > 10 ? 10 : confirmed.length

    const [transactionCount, setTransactionCount] = useState(getInitialCount())
    const [isLoading, setIsLoading] = useState(false)

    const loaderRef = useRef<HTMLImageElement>(null)
    const observerRef = useRef<IntersectionObserver | null>(null)
    const oldNetworkIdRef = useRef<number | null>(chainId)
    const oldAccountAddressRef = useRef<string | null>(address)

    const getTransactions = () =>
        flagQueuedTransactions(pending).concat(
            confirmed.slice(0, transactionCount)
        )

    useEffect(() => {
        if (!loaderRef.current) return
        if (observerRef.current) observerRef.current.disconnect()

        observerRef.current = new IntersectionObserver(
            async (entries) => {
                const countToLoad = confirmed.length - transactionCount

                if (countToLoad === 0) return

                const entry = entries[0]
                if (!entry || !entry.isIntersecting) return

                setIsLoading(true)

                await new Promise((resolve) => setTimeout(resolve, 300))

                setTransactionCount(
                    transactionCount + (countToLoad > 10 ? 10 : countToLoad)
                )
                setIsLoading(false)
            },
            { threshold: 0.5 }
        )

        observerRef.current.observe(loaderRef.current)

        return () => {
            if (!observerRef.current) return

            observerRef.current.disconnect()
        }
    }, [transactionCount, confirmed, observerRef])

    useEffect(() => {
        if (
            chainId === oldNetworkIdRef.current &&
            address === oldAccountAddressRef.current
        )
            return

        oldNetworkIdRef.current = chainId
        oldAccountAddressRef.current = address

        setTransactionCount(getInitialCount())
    }, [confirmed, chainId, oldNetworkIdRef, address, oldAccountAddressRef])

    return (
        <div className="flex flex-col flex-1 w-full space-y-0" data-testid="activity-list">
            {getTransactions().map((t, i) => (
                <React.Fragment key={i}>
                    {i > 0 ? <hr /> : null}
                    <Transaction transaction={t} index={i} />
                </React.Fragment>
            ))}
            <img
                ref={loaderRef}
                src={dotLoading}
                alt="Loader"
                aria-label="loading"
                role="alert" 
                aria-busy="true"
                className={classnames(
                    "m-auto w-8 mt-4",
                    isLoading ? "opacity-100" : "opacity-0"
                )}
            />
        </div>
    )
}

export default ActivityList
