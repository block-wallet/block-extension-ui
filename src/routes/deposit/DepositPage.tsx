import React, { useEffect, useState, useMemo } from "react"
import { BigNumber } from "ethers"
import { parseUnits } from "ethers/lib/utils"

import PopupFooter from "../../components/popup/PopupFooter"
import PopupHeader from "../../components/popup/PopupHeader"
import PopupLayout from "../../components/popup/PopupLayout"
import VerticalSelect from "../../components/input/VerticalSelect"

import { Classes } from "../../styles/classes"

import { useSelectedAccount } from "../../context/hooks/useSelectedAccount"
import { useSelectedNetwork } from "../../context/hooks/useSelectedNetwork"

import { getCurrencyAmountList } from "../../context/util/getCurrencyAmountList"

import { KnownCurrencies } from "@blank/background/controllers/blank-deposit/types"
import { usePendingDeposits } from "../../context/hooks/usePendingDeposits"
import { useOnMountHistory } from "../../context/hooks/useOnMount"
import Spinner from "../../components/Spinner"
import { AssetSelection } from "../../components/assets/tokens/AssetSelection"
import { useDepositTokens } from "../../context/hooks/useDepositTokens"
import { TokenWithBalance } from "../../context/hooks/useTokensList"
import { ButtonWithLoading } from "../../components/button/ButtonWithLoading"

const DepositPage = () => {
    const account = useSelectedAccount()
    const { chainId, nativeCurrency } = useSelectedNetwork()

    const [selectedCurrency, setSelectedCurrency] = useState<KnownCurrencies>()
    const [selectedToken, setSelectedToken] = useState<TokenWithBalance>()

    const [amount, setAmount] = useState<string>()
    const [amountsList, setAmountsList] = useState<Array<any>>([])

    const globalPendingDeposits = usePendingDeposits()
    const [pendingDeposits, setPendingDeposits] = useState<{
        [k: string]: boolean
    }>({})

    const [disabledOptions, setDisabledOptions] = useState<boolean[]>([])

    const tokens = useDepositTokens()

    const selectedTokenBalance = useMemo(() => {
        const keys = Object.keys(account.balances[chainId].tokens)

        const key = keys.find((key) => {
            return (
                account.balances[chainId].tokens[
                    key
                ].token.symbol.toLowerCase() === selectedCurrency?.toLowerCase()
            )
        })

        return key
            ? BigNumber.from(account.balances[chainId].tokens[key].balance)
            : BigNumber.from(0)
    }, [selectedCurrency, account.balances, chainId])

    useEffect(() => {
        if (!selectedCurrency) return

        const amounts = getCurrencyAmountList(selectedCurrency)
        setAmountsList(amounts)

        setPendingDeposits(
            globalPendingDeposits
                ? globalPendingDeposits[selectedCurrency]
                : ({} as any)
        )
    }, [selectedCurrency, globalPendingDeposits])

    useEffect(() => {
        if (!selectedCurrency) return

        const amounts: string[] = getCurrencyAmountList(selectedCurrency)

        setDisabledOptions(
            amounts.map((amount: string) =>
                selectedTokenBalance.lt(
                    parseUnits(amount, nativeCurrency.decimals)
                )
            )
        )
    }, [selectedCurrency, selectedTokenBalance, nativeCurrency])

    const history = useOnMountHistory()
    const next = () => {
        history.push({
            pathname: "/privacy/deposit/confirm",
            state: { amount, selectedToken, selectedCurrency },
        })
    }

    return (
        <PopupLayout
            header={<PopupHeader title="Deposit to Privacy Pool" />}
            footer={
                <PopupFooter>
                    <ButtonWithLoading
                        label="Next"
                        disabled={
                            !amount ||
                            (pendingDeposits && pendingDeposits[amount!])
                        }
                        onClick={next}
                    />
                </PopupFooter>
            }
        >
            <div className="flex flex-col p-6 space-y-1">
                <AssetSelection
                    assets={tokens}
                    onAssetChange={(asset) => {
                        setSelectedToken(asset)
                        setSelectedCurrency(
                            asset.token.symbol.toLowerCase() as KnownCurrencies
                        )
                    }}
                    topMargin={76}
                    bottomMargin={64}
                />
                {selectedCurrency && (
                    <>
                        <label htmlFor="address" className={Classes.inputLabel}>
                            Select Amount
                        </label>
                        <VerticalSelect
                            options={amountsList}
                            value={amount}
                            onChange={setAmount}
                            disabledOptions={Object.values(pendingDeposits).map(
                                (value, i) => value || disabledOptions[i]
                            )}
                            display={(option) => (
                                <div
                                    title={`Deposit ${option} ${selectedCurrency.toUpperCase()} to Privacy Pool`}
                                    className="w-full flex flex-row justify-between"
                                >
                                    <span className="text-left w-22">
                                        {option}{" "}
                                        {selectedCurrency.toUpperCase()}
                                    </span>
                                    {pendingDeposits[option] ? (
                                        <>
                                            <span className="text-xs mt-0.5">
                                                Pending deposit...
                                            </span>
                                            <Spinner />
                                        </>
                                    ) : (
                                        ""
                                    )}
                                </div>
                            )}
                        />
                    </>
                )}
            </div>
        </PopupLayout>
    )
}

export default DepositPage
