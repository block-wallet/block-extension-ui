import React, { FunctionComponent } from "react"
import { FaExchangeAlt } from "react-icons/fa"
import { FiUpload } from "react-icons/fi"
import { RiCopperCoinFill } from "react-icons/ri"
import { ImSpinner } from "react-icons/im"
import { ContextMenuTrigger, ContextMenu, MenuItem } from "react-contextmenu"
import { BigNumber } from "ethers"

// Components
import ComplianceMenu from "../components/withdraw/ComplianceMenu"
import { AssetIcon } from "./AssetsList"

// Asset
import eth from "../assets/images/icons/ETH.svg"
import blankLogo from "../assets/images/logo.svg"

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

const transactionMessages = {
    [TransactionCategories.BLANK_DEPOSIT]: "Blank Deposit",
    [TransactionCategories.BLANK_WITHDRAWAL]: "Blank Withdrawal",
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
    <div className="flex flex-row items-center justify-center w-9 h-9 p-1.5 bg-white border border-gray-200 rounded-full">
        {transactionStatus !== TransactionStatus.SUBMITTED ? (
            transactionIcon ? (
                <div>
                    <AssetIcon asset={{
                        logo: transactionIcon,
                        symbol: "",
                    }} />
                </div>
            ) : category ? (
                transactionIcons[category]
            ) : null
        ) : (
            <PendingSpinner />
        )}
    </div>
)

const getTransactionTime = (
    status: TransactionStatus,
    time: number,
    pendingIndex: number
) => {
    const { color, label } =
        status === TransactionStatus.SUBMITTED
            ? pendingIndex === 0
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
): React.ReactNode => {
    const getCategoryMessage = () => {
        const isPending =
            status === TransactionStatus.SUBMITTED && pendingIndex === 0

        if (!transactionCategory) {
            return ""
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
    index: number
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
            index
        )
    }
}

const Transaction: FunctionComponent<{
    transaction: TransactionMeta
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
    },
}) => {
    const state = useBlankState()!
    const {
        nativeCurrency: networkNativeCurrency,
        iconUrls,
    } = useSelectedNetwork()

    const txHash = hash
    const transfer = transferType ?? {
        amount: value,
        currency: networkNativeCurrency.symbol,
        decimals: networkNativeCurrency.decimals,
        logo: iconUrls ? iconUrls[0] : eth,
    }
    const isBlankWithdraw: boolean =
        transactionCategory === "blankWithdrawal" ? true : false
    const blankWithdrawId: string = id

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
                    <div className="flex flex-row items-center">
                        <TransactionIcon
                            transaction={{
                                transactionCategory,
                                transactionStatus: status,
                            }}
                            transactionIcon={transfer.logo}
                        />
                        <div className="flex flex-col ml-2">
                            <span className="text-sm font-bold">
                                {getTransactionLabel(
                                    status,
                                    index,
                                    transactionCategory,
                                    methodSignature,
                                    networkNativeCurrency
                                )}
                            </span>
                            {getTransactionTimeOrStatus(
                                status,
                                confirmationTime,
                                submittedTime,
                                time,
                                index
                            )}
                        </div>
                    </div>

                    {/* Amount */}
                    <div className="flex flex-col items-end w-2/6">
                        {transfer.amount ? (
                            <>
                                <span
                                    className="text-sm font-bold text-right truncate"
                                    title={formatTransactionValue(
                                        transfer as TransferType
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
                                                ).eq(0)
                                                    ? ""
                                                    : "-"
                                        }
                                    })()}
                                    {formatTransactionValue(
                                        transfer as TransferType,
                                        true,
                                        5
                                    )}
                                </span>
                                <span className="text-xs text-gray-600">
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
                                        }
                                    )}
                                </span>
                            </>
                        ) : null}
                    </div>
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
    const { confirmed, pending } = useBlankState()!.activityList

    return (
        <div className="flex flex-col flex-1 w-full space-y-0">
            {pending.concat(confirmed).map((t, i) => (
                <React.Fragment key={i}>
                    {i > 0 ? <hr /> : null}
                    <Transaction transaction={t} index={i} />
                </React.Fragment>
            ))}
        </div>
    )
}

export default ActivityList
