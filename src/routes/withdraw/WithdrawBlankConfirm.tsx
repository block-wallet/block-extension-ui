import React, { useState } from "react"

import PopupHeader from "../../components/popup/PopupHeader"
import PopupLayout from "../../components/popup/PopupLayout"

import AccountIcon from "../../components/icons/AccountIcon"
import { getAccountColor } from "../../util/getAccountColor"
import blankIcon from "../../assets/images/logo.svg"
import arrow from "../../assets/images/icons/arrow_right_black.svg"

import PopupFooter from "../../components/popup/PopupFooter"
import {
    getWithdrawalFees,
    makeBlankWithdrawal,
    searchTokenInAssetsList,
} from "../../context/commActions"
import { CurrencyAmountPair } from "@blank/background/controllers/blank-deposit/types"
import { useBlankState } from "../../context/background/backgroundHooks"
import { AccountInfo } from "@blank/background/controllers/AccountTrackerController"
import Spinner from "../../components/Spinner"
import { utils } from "ethers"
import { formatHash, formatName } from "../../util/formatAccount"
import { formatCurrency, toCurrencyAmount } from "../../util/formatCurrency"
import ErrorMessage from "../../components/error/ErrorMessage"
import { useOnMountHistory } from "../../context/hooks/useOnMount"
import { useAsync } from "../../util/hooks/useAsync"
import { formatUnits, parseUnits } from "ethers/lib/utils"
import { formatRounded } from "../../util/formatRounded"
import { EnsResult } from "../../util/searchEns"

import infoIcon from "../../assets/images/icons/info_circle.svg"
import FeesTooltip from "../../components/label/FeesTooltip"
import { AiFillInfoCircle } from "react-icons/ai"
import { hasDepositedRecently } from "../../util/hasDepositedRecently"
import { WithdrawTimeFrameWarning } from "./WithdrawTimeFrameWarning"
import { Link } from "react-router-dom"
import CloseIcon from "../../components/icons/CloseIcon"
import { useSelectedNetwork } from "../../context/hooks/useSelectedNetwork"
import { DEFAULT_DECIMALS } from "../../util/constants"
import { BigNumber } from "ethers"
import { useGasPriceData } from "../../context/hooks/useGasPriceData"
import { ButtonWithLoading } from "../../components/button/ButtonWithLoading"
import SuccessDialog from "../../components/dialog/SuccessDialog"
import GenericTooltip from "../../components/label/GenericTooltip"
import { useAddressBook } from "../../context/hooks/useAddressBook"

const WithdrawBlankConfirm = () => {
    const history: any = useOnMountHistory()
    const { pair, address: accountAddress, ens, external } = history.location
        .state as {
        pair: CurrencyAmountPair
        address: string
        ens: EnsResult | undefined
        external: boolean | undefined
    }

    const [isWithdrawing, setisWithdrawing] = useState(false)
    const [hasHigherFee, setHasHigherFee] = useState(false)
    const [saved, setSaved] = useState(false)
    const [error, setError] = useState("")
    const [tokenDecimals, setTokenDecimals] = useState<number | undefined>()

    // Same day withdraw warning
    const [recentlyDeposited, setRecentlyDeposited] = useState<
        boolean | undefined
    >(undefined)
    useAsync(async () => {
        if (recentlyDeposited === false) {
            return
        }

        try {
            const recentlyDeposited = await hasDepositedRecently(pair)
            setRecentlyDeposited(recentlyDeposited)
        } catch {
            setRecentlyDeposited(false)
        }
    }, [])

    const state = useBlankState()!
    const network = useSelectedNetwork()
    const { gasPricesLevels } = useGasPriceData()
    const amountInNativeCurrency = toCurrencyAmount(
        utils.parseUnits(pair.amount, network.nativeCurrency.decimals),
        state.exchangeRates[pair.currency.toUpperCase()],
        network.nativeCurrency.decimals
    )

    const { accounts } = state
    const addressBook = useAddressBook()

    const account =
        accountAddress in accounts
            ? (accounts[accountAddress] as AccountInfo)
            : accountAddress in addressBook
            ? ({
                  name: addressBook[accountAddress].name,
                  address: addressBook[accountAddress].address,
              } as AccountInfo)
            : undefined

    // If we have gasPrice, this mean it's a non EIP-1559 network
    // otherwise we use maxFeePerGas
    const fastGasPrice = gasPricesLevels.fast.gasPrice
        ? gasPricesLevels.fast.gasPrice._hex
        : gasPricesLevels.fast.maxFeePerGas!._hex

    let decimals

    const [estimatedFee, err] = useAsync(async () => {
        const { totalFee, gasFee, relayerFee } = await getWithdrawalFees(pair)
        decimals = tokenDecimals
        if (!decimals) {
            const token = await searchTokenInAssetsList(pair.currency, true)
            decimals = token.length !== 0 ? token[0].decimals : DEFAULT_DECIMALS

            setTokenDecimals(decimals)
        }

        // If no exchange rate available, display zero
        const symbol = pair.currency.toUpperCase()
        const exchangeRate =
            symbol in state.exchangeRates ? state.exchangeRates[symbol] : 0

        if (BigNumber.from(totalFee).gt(parseUnits(pair.amount, decimals))) {
            setError("Fees are higher than the amount to withdraw")
            setHasHigherFee(true)
        } else {
            setHasHigherFee(false)
        }

        return {
            gasFee: formatRounded(formatUnits(gasFee, decimals), 5),
            relayerFee: formatRounded(formatUnits(relayerFee, decimals), 5),
            totalFee: formatRounded(formatUnits(totalFee, decimals), 5),
            totalFeeInNativeCurrency: formatCurrency(
                toCurrencyAmount(totalFee, exchangeRate, decimals),
                {
                    currency: state.nativeCurrency,
                    locale_info: state.localeInfo,
                    showSymbol: true,
                }
            ),
        }
        // Set fastGasPrice as dependency to force update on gas price change
    }, [fastGasPrice])

    const confirm = async () => {
        if (!estimatedFee) return
        if (hasHigherFee) return

        try {
            setisWithdrawing(true)
            // Send amount to address
            await makeBlankWithdrawal(pair, accountAddress)
            setSaved(true)
        } catch {
            setError("Error withdrawing")
            setisWithdrawing(false)
        }
    }

    /**
     * Returns fee details to be display on the info tooltip
     * @param values Whether to display the fees or the explanatory text
     */
    const getFeeDetail = () => (
        <div className="flex flex-col font-normal items-start text-xs text-white-500">
            <div className="flex flex-row items-end space-x-7">
                <span>Gas cost:</span>
                <span>
                    {estimatedFee?.gasFee} {pair.currency.toUpperCase()}
                </span>
            </div>
            <div className="flex flex-row items-end space-x-4">
                <span>Relayer fee:</span>{" "}
                <span>
                    {estimatedFee?.relayerFee} {pair.currency.toUpperCase()}
                </span>
            </div>
        </div>
    )

    return recentlyDeposited ? (
        <WithdrawTimeFrameWarning
            onConfirm={() => setRecentlyDeposited(false)}
            onCancel={() => {
                history.push({
                    pathname: "/privacy/withdraw/blank/accounts",
                    state: { pair },
                })
            }}
            currency={pair.currency}
        />
    ) : recentlyDeposited === false ? (
        <PopupLayout
            header={
                <PopupHeader
                    title="Confirm Withdraw"
                    close={false}
                    onBack={() => {
                        history.push({
                            pathname: external
                                ? "/privacy/withdraw/external"
                                : "/privacy/withdraw/blank/accounts",
                            state: { pair },
                        })
                    }}
                >
                    <>
                        <div className="group relative">
                            <a
                                href="https://help.blockwallet.io"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <AiFillInfoCircle
                                    size={26}
                                    className="pl-2 text-primary-200 cursor-pointer hover:text-primary-300"
                                />
                            </a>
                            <GenericTooltip
                                className="w-52 p-2"
                                centerX
                                content={
                                    <div className="flex flex-col font-normal items-start text-xs text-white-500">
                                        <div className="flex flex-row items-end space-x-7">
                                            <span>
                                                A short time span since last
                                                deposit, may increase
                                            </span>{" "}
                                        </div>
                                        <div className="flex flex-row items-end space-x-4">
                                            <span>
                                                the risks of deanonymization.
                                                Click on this icon
                                            </span>{" "}
                                        </div>
                                        <div className="flex flex-row items-end space-x-4">
                                            <span>
                                                to learn more on how to stay
                                                anonymous!
                                            </span>{" "}
                                        </div>
                                    </div>
                                }
                            />
                        </div>
                        {!isWithdrawing && (
                            <Link
                                to={"/"}
                                className="p-2 ml-auto -mr-2 text-gray-900 transition duration-300 rounded-full hover:bg-primary-100 hover:text-primary-300"
                                draggable={false}
                            >
                                <CloseIcon />
                            </Link>
                        )}
                    </>
                </PopupHeader>
            }
            footer={
                <PopupFooter>
                    <ButtonWithLoading
                        type="submit"
                        onClick={confirm}
                        label="Confirm"
                        disabled={
                            isWithdrawing || !estimatedFee || hasHigherFee
                        }
                        isLoading={isWithdrawing}
                    />
                </PopupFooter>
            }
        >
            <SuccessDialog
                open={saved}
                title="Success"
                message="You've initiated the withdrawal."
                timeout={1400}
                onDone={() => history.push("/")}
            />
            <div className="flex flex-col p-6 space-y-4">
                <div className="flex flex-col items-center w-full p-6 space-y-8 text-sm text-center rounded-md bg-primary-100">
                    <div className="flex flex-row space-x-4">
                        <div className="flex flex-col items-center flex-1 space-y-2">
                            <img
                                src={blankIcon}
                                alt="account"
                                className="w-10 h-10"
                            />
                            <span className="w-20 whitespace-nowrap">
                                Privacy Pool
                            </span>
                        </div>
                        <img src={arrow} alt="arrow" className="w-4 h-4 mt-3" />
                        <div className="flex flex-col items-center flex-1 space-y-2">
                            <AccountIcon
                                className="w-10 h-10"
                                fill={getAccountColor(account?.address || "1")}
                            />
                            <span className="w-20 whitespace-nowrap">
                                {formatName(
                                    account ? account.name : "External"
                                )}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-2xl font-bold">
                            {pair.amount} {pair.currency.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">
                            {formatCurrency(amountInNativeCurrency, {
                                currency: state.nativeCurrency,
                                locale_info: state.localeInfo,
                                showSymbol: true,
                            })}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col space-y-4 text-sm font-bold">
                    <div className="flex flex-row items-start justify-between">
                        <span>From:</span>
                        <div className="flex flex-row items-center justify-start w-32 space-x-2">
                            <img src={blankIcon} className="w-7 h-7" alt="" />
                            <span>Privacy Pool</span>
                        </div>
                    </div>
                    <hr />
                    <div className="flex flex-row items-start justify-between">
                        <span>To:</span>
                        <div className="flex flex-row items-center justify-start w-32 space-x-2">
                            <AccountIcon
                                className="w-7 h-7"
                                fill={getAccountColor(account?.address || "1")}
                            />
                            <div className="flex flex-col">
                                <span>
                                    {formatName(
                                        account ? account.name : "External",
                                        10
                                    )}
                                </span>
                                <span className="text-xs font-normal text-gray-500">
                                    {ens
                                        ? ens.name
                                        : formatHash(accountAddress)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div className="flex flex-row items-start justify-between">
                        <div className="flex flex-row space-x-2">
                            <div className="group relative">
                                <img
                                    src={infoIcon}
                                    alt="info"
                                    className="w-3 h-3 mt-1 font-normal text-xs text-gray-500"
                                />
                                <FeesTooltip content={getFeeDetail()} />
                            </div>
                            <span>Fees:</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-sm">
                                {estimatedFee ? (
                                    `${
                                        estimatedFee.totalFee
                                    } ${pair.currency.toUpperCase()}`
                                ) : err ? (
                                    "-"
                                ) : (
                                    <Spinner />
                                )}
                            </span>
                            <span className="text-xs text-gray-600">
                                {estimatedFee &&
                                    `${estimatedFee.totalFeeInNativeCurrency}`}
                            </span>
                        </div>
                    </div>
                    <ErrorMessage error={error} />
                </div>
            </div>
        </PopupLayout>
    ) : (
        <Spinner />
    )
}

export default WithdrawBlankConfirm
