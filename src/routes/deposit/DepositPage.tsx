import React, { useEffect, useState } from "react"

import PopupFooter from "../../components/popup/PopupFooter"
import PopupHeader from "../../components/popup/PopupHeader"
import PopupLayout from "../../components/popup/PopupLayout"

import { Classes } from "../../styles/classes"

import VerticalSelect from "../../components/input/VerticalSelect"
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
    const [selectedCurrency, setSelectedCurrency] = useState<KnownCurrencies>()
    const [selectedToken, setSelectedToken] = useState<TokenWithBalance>()

    const [amount, setAmount] = useState<string>()
    const [amountsList, setAmountsList] = useState<Array<any>>([])

    const globalPendingDeposits = usePendingDeposits()
    const [pendingDeposits, setPendingDeposits] = useState<any>(undefined)

    const tokens = useDepositTokens()

    useEffect(() => {
        if (selectedCurrency) {
            const amounts = getCurrencyAmountList(selectedCurrency)
            setAmountsList(amounts)

            setPendingDeposits(
                globalPendingDeposits
                    ? globalPendingDeposits[selectedCurrency]
                    : ({} as any)
            )
        }
    }, [selectedCurrency, globalPendingDeposits])

    const history = useOnMountHistory()
    const next = () => {
        history.push({
            pathname: "/privacy/deposit/confirm",
            state: { amount, selectedToken, selectedCurrency },
        })
    }

    return (
        <PopupLayout
            header={<PopupHeader title="Deposit to Blank" close="/privacy" />}
            footer={
                <PopupFooter>
                    {/*<button
                        disabled={
                            !amount ||
                            (pendingDeposits && pendingDeposits[amount!])
                        }
                        onClick={next}
                        className={classnames(
                            Classes.button,
                            "w-1/2 font-bold",
                            !amount && "opacity-50",
                            amount &&
                                pendingDeposits[amount] &&
                                "opacity-50 pointer-events-none"
                        )}
                    >
                        Next
                    </button>*/}

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
                            disabledOptions={pendingDeposits}
                            display={(option) => (
                                <div
                                    title={`Deposit ${option} ${selectedCurrency.toUpperCase()} to Blank`}
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
