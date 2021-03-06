import { formatUnits } from "ethers/lib/utils"
import React, { useState } from "react"
import { Link } from "react-router-dom"
import { deleteCustomToken } from "../../context/commActions"
import { useOnMountHistory } from "../../context/hooks/useOnMount"
import { useSelectedAccount } from "../../context/hooks/useSelectedAccount"
import { useSelectedNetwork } from "../../context/hooks/useSelectedNetwork"
import { classnames } from "../../styles"
import { formatRounded } from "../../util/formatRounded"
import useCurrencyFromatter from "../../util/hooks/useCurrencyFormatter"
import useGetAssetByTokenAddress from "../../util/hooks/useGetAssetByTokenAddress"
import useTokenTransactions from "../../util/hooks/useTokenTransactions"
import { useBlankState } from "../../context/background/backgroundHooks"
import { generateExplorerLink, getExplorerTitle } from "../../util/getExplorer"
import { AssetIcon } from "../AssetsList"
import RoundedIconButton from "../button/RoundedIconButton"

import ArrowHoverAnimation from "../icons/ArrowHoverAnimation"
import TrashBinIcon from "../icons/TrashBinIcon"
import openExternal from "../../assets/images/icons/open_external.svg"
import PopupHeader from "../popup/PopupHeader"
import PopupLayout from "../popup/PopupLayout"
import TokenSummary from "../TokenSummary"
import TransactionsList from "../transactions/TransactionsList"

import log from "loglevel"
import ConfirmDialog from "../dialog/ConfirmDialog"
import { isNativeTokenAddress } from "../../util/tokenUtils"
import SuccessDialog from "../dialog/SuccessDialog"
import { formatName } from "../../util/formatAccount"
import eye from "../../assets/images/icons/eye.svg"

const AssetDetailsPage = () => {
    const history: any = useOnMountHistory()
    const address = history.location.state.address

    const { availableNetworks, selectedNetwork } = useBlankState()!

    const account = useSelectedAccount()
    const currencyFormatter = useCurrencyFromatter()
    const { isSendEnabled, isTornadoEnabled } = useSelectedNetwork()
    const asset = useGetAssetByTokenAddress(address)
    const isNative = isNativeTokenAddress(address)
    const tokenTransactions = useTokenTransactions(asset?.token?.symbol)

    const [confirmOpen, setConfirmOpen] = useState(false)
    const [isRemoving, setIsRemoving] = useState(false)
    const [successOpen, setSuccessOpen] = useState(false)

    if (!asset) {
        return null
    }

    const { token, balance } = asset
    if (!token) {
        return <p>Token not found</p>
    }

    const formattedTokenBalance = formatUnits(balance || "0", token.decimals)

    const roundedTokenBalance = formatRounded(formattedTokenBalance, 5)

    const explorerName = getExplorerTitle(availableNetworks, selectedNetwork)

    const optionsWidth = (explorerName?.length ?? 0) > 10 ? "w-44" : "w-40"

    const removeToken = async () => {
        try {
            setIsRemoving(true)
            await deleteCustomToken(token.address)
            setIsRemoving(false)

            history.push({ pathname: "/home" })
        } catch (error) {
            log.error("Eror deleting token from list")
        }
    }

    return (
        <PopupLayout
            header={
                <PopupHeader
                    onBack={() => history.push("/home")}
                    title={`${formatName(account.name, 18)} - ${token.symbol}`}
                    close={false}
                    disabled={isRemoving}
                    actions={
                        !isNative
                            ? [
                                  <a
                                      href={generateExplorerLink(
                                          availableNetworks,
                                          selectedNetwork,
                                          token.address,
                                          "address"
                                      )}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      key={1}
                                  >
                                      <div
                                          className={classnames(
                                              "text-grey-900 cursor-pointer flex flex-row p-2 items-center hover:bg-gray-100 rounded-t-md",
                                              optionsWidth
                                          )}
                                      >
                                          <div className="pl-1 pr-1 w-8">
                                              <img
                                                  width={"16"}
                                                  height={"16"}
                                                  src={openExternal}
                                                  alt={`View on ${explorerName}`}
                                              />
                                          </div>
                                          <span>View on {explorerName}</span>
                                      </div>
                                  </a>,
                                  <div
                                      key={2}
                                      onClick={() => {
                                          setConfirmOpen(true)
                                      }}
                                      className={classnames(
                                          "text-red-500 cursor-pointer flex flex-row p-2 items-center hover:bg-gray-100 rounded-b-md w-40",
                                          optionsWidth
                                      )}
                                  >
                                      <div className="pl-1 pr-1 w-8">
                                          <TrashBinIcon fill="red" />
                                      </div>
                                      <span>Remove Token</span>
                                  </div>,
                              ]
                            : undefined
                    }
                />
            }
        >
            <ConfirmDialog
                title="Remove Token"
                message={`Are you sure you want to remove ${token.symbol} token from the list?`}
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={() => {
                    setSuccessOpen(true)
                    setConfirmOpen(false)
                }}
            />
            <SuccessDialog
                open={successOpen}
                title={"Token Removed"}
                message={`${token.symbol} token was successfully removed.`}
                onDone={() => {
                    setSuccessOpen(false)
                    removeToken()
                }}
                timeout={1000}
            />

            <div className="flex flex-col items-start flex-1 w-full h-0 max-h-screen p-6 space-y-6 overflow-auto hide-scroll">
                <TokenSummary minHeight="13rem">
                    <TokenSummary.Balances>
                        <AssetIcon filled asset={token} />
                        <TokenSummary.TokenBalance
                            title={`${formattedTokenBalance} ${token.symbol}`}
                        >
                            {`${roundedTokenBalance} ${token.symbol}`}
                        </TokenSummary.TokenBalance>
                        <TokenSummary.ExchangeRateBalance>
                            {currencyFormatter.format(
                                balance,
                                token.symbol,
                                token.decimals
                            )}
                        </TokenSummary.ExchangeRateBalance>
                    </TokenSummary.Balances>
                    <TokenSummary.Actions>
                        <Link
                            to={{
                                pathname: "/send",
                                state: { asset, transitionDirection: "left" },
                            }}
                            draggable={false}
                            className={classnames(
                                "flex flex-col items-center space-y-2 group",
                                !isSendEnabled && "pointer-events-none"
                            )}
                        >
                            <RoundedIconButton
                                Icon={ArrowHoverAnimation}
                                disabled={!isSendEnabled}
                            >
                                Send
                            </RoundedIconButton>
                        </Link>
                        {isTornadoEnabled && asset.isDepositable && (
                            <Link
                                to={{
                                    pathname: "/privacy",
                                    state: {
                                        preSelectedAsset: asset,
                                        transitionDirection: "left",
                                    },
                                }}
                                draggable={false}
                                className="flex flex-col items-center space-y-2 group"
                            >
                                <div className="group w-8 h-8 flex items-center overflow-hidden transition duration-300 rounded-full bg-primary-300 group-hover:opacity-75">
                                    <img
                                        alt="Privacy"
                                        src={eye}
                                        className="w-full h-3 group-hover:animate-privacy-rotate select-none"
                                    />
                                </div>
                                <span className="text-xs font-medium">
                                    Privacy
                                </span>
                            </Link>
                        )}
                    </TokenSummary.Actions>
                </TokenSummary>
                <div className="flex flex-col flex-1 w-full space-y-0 border-t border-gray-200">
                    {tokenTransactions.length > 0 ? (
                        <TransactionsList transactions={tokenTransactions} />
                    ) : (
                        <span className="text-sm text-gray-500 pt-4 mx-auto">
                            You have no transactions.
                        </span>
                    )}
                </div>
            </div>
        </PopupLayout>
    )
}

export default AssetDetailsPage
