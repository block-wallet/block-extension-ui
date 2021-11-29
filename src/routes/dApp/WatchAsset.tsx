import type {
    DappRequestParams,
    DappSignatureReq,
    NormalizedSwitchEthereumChainParameters,
    RawSignatureData,
    WatchAssetConfirmParams,
    WatchAssetReq,
} from "@blank/background/utils/types/ethereum"
import type { SiteMetadata } from "@blank/provider/types"
import AccountIcon from "../../components/icons/AccountIcon"
import CopyTooltip from "../../components/label/СopyToClipboardTooltip"
import Divider from "../../components/Divider"
import PopupFooter from "../../components/popup/PopupFooter"
import PopupHeader from "../../components/popup/PopupHeader"
import PopupLayout from "../../components/popup/PopupLayout"
import React, { useState, useEffect } from "react"
import Tooltip from "../../components/label/Tooltip"
import blankIcon from "../../assets/images/logo.svg"
import classnames from "classnames"
import useNextRequestRoute from "../../context/hooks/useNextRequestRoute"
import { AiFillInfoCircle, AiFillQuestionCircle } from "react-icons/ai"
import { Classes } from "../../styles/classes"
import { DappReq, useDappRequest } from "../../context/hooks/useDappRequest"
import { Redirect } from "react-router"
import { capitalize } from "../../util/capitalize"
import { confirmDappRequest, getTokenBalance } from "../../context/commActions"
import { formatHash, formatName } from "../../util/formatAccount"
import { formatNumberLength } from "../../util/formatNumberLength"
import { formatUnits } from "ethers/lib/utils"
import { getAccountColor } from "../../util/getAccountColor"
import { useBlankState } from "../../context/background/backgroundHooks"
import { useSelectedNetwork } from "../../context/hooks/useSelectedNetwork"
import { useTokensList } from "../../context/hooks/useTokensList"
import { useSelectedAccount } from "../../context/hooks/useSelectedAccount"
import WarningTip from "../../components/label/WarningTip"
import { formatRounded } from "../../util/formatRounded"
import unknownTokenIcon from "../../assets/images/unknown_token.svg"
import GenericTooltip from "../../components/label/GenericTooltip"
import { ButtonWithLoading } from "../../components/button/ButtonWithLoading"

const UNKNOWN_BALANCE = "UNKNOWN_BALANCE"
const IS_BASE64_IMAGE = "IS_BASE64_IMAGE"

const WatchAssetPage = () => {
    const dappRequest = useDappRequest()
    const route = useNextRequestRoute()

    return typeof dappRequest !== "undefined" &&
        dappRequest.type === DappReq.ASSET ? (
            <WatchAsset
            requestCount={dappRequest.requestCount}
            requestId={dappRequest.requestId}
            origin={dappRequest.origin}
            siteMetadata={dappRequest.siteMetadata}
            dappReqData={dappRequest.dappReqData}
        />
    ) : (
        <Redirect to={route} />
    )
}

const WatchAsset = ({
    requestCount,
    requestId,
    dappReqData,
}: {
    dappReqData:
        | Record<string, unknown>
        | DappSignatureReq<keyof RawSignatureData>
        | NormalizedSwitchEthereumChainParameters
        | WatchAssetReq
    requestCount: number
    requestId: string
    origin: string
    siteMetadata: SiteMetadata
}) => {
    const network = useSelectedNetwork()
    const { accounts } = useBlankState()!
    const selectedAccount = useSelectedAccount()
    const { nativeToken } = useTokensList()
    const [copied, setCopied] = useState(false)
    const [balance, setBalance] = useState("")
    const [isImageSaved, setIsImageSaved] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const {
        params: token,
        accountAddress,
        isUpdate,
        savedToken,
    } = dappReqData as DappRequestParams[DappReq.ASSET]

    const accountData =
        accounts[accountAddress ? accountAddress : selectedAccount.address]

    const isBase64Image = token.image === IS_BASE64_IMAGE

    const assetImageSrc = (): string => {
        if (isBase64Image || !isImageSaved) {
            return unknownTokenIcon
        }

        return token.image ?? unknownTokenIcon
    }

    const addToken = async () => {
        setIsSaving(true)
        await confirmDappRequest(requestId, true, {
            symbol: token.symbol,
            decimals: token.decimals,
            image: assetImageSrc(),
        } as WatchAssetConfirmParams)
    }

    const reject = () => {
        confirmDappRequest(requestId, false)
    }

    const copyAssetAddress = async () => {
        await navigator.clipboard.writeText(token.address)
        setCopied(true)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setCopied(false)
    }

    useEffect(() => {
        getTokenBalance(token.address, accountData.address)
            .then((fetchedBalance) => {
                setBalance(
                    formatRounded(
                        formatUnits(fetchedBalance || "0", token.decimals)
                    )
                )
            })
            .catch((error: Error) => {
                // If this happens the asset doesn't exist
                // (At least on current chain)
                if (error.message.includes("code=CALL_EXCEPTION")) {
                    setBalance(UNKNOWN_BALANCE)
                }
            })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const UpdateAssetLayout = () => {
        return (
            <>
                <div className="px-6 pt-3">
                    <WarningTip
                        text="Updating existing assets could put your privacy at risk or be used to scam you."
                        fontSize="text-xs"
                    />
                </div>
                <div className="flex flex-row items-center px-6 py-3">
                    <div className="flex flex-row items-center justify-center w-10 h-10 rounded-full bg-primary-100">
                        <img
                            alt="icon"
                            src={
                                savedToken!.image
                                    ? savedToken!.image
                                    : blankIcon
                            }
                        />
                    </div>
                    <button
                        type="button"
                        className="relative flex flex-col group space-y-1 ml-4"
                        onClick={() => copyAssetAddress()}
                    >
                        <span className="text-sm font-bold">
                            {savedToken!.symbol}
                        </span>
                        <span className="text-xs text-gray-600">
                            {formatHash(savedToken!.address)}
                        </span>
                        <CopyTooltip copied={copied} />
                    </button>
                </div>
                <span className="font-bold px-6 text-sm text-gray-800">
                    With asset:
                </span>
            </>
        )
    }

    return (
        <PopupLayout
            header={
                <PopupHeader
                    title={(isUpdate ? "Update" : "Add") + " Asset"}
                    close={false}
                    backButton={false}
                >
                    {requestCount > 1 && (
                        <div className="group relative">
                            <AiFillInfoCircle
                                size={26}
                                className="pl-2 text-primary-200 cursor-pointer hover:text-primary-300"
                            />
                            <Tooltip
                                content={`${requestCount - 1} more ${
                                    requestCount > 2 ? "requests" : "request"
                                }`}
                            />
                        </div>
                    )}
                    <span className="ml-auto text-sm text-gray-800">
                        {capitalize(network.name)}
                    </span>
                </PopupHeader>
            }
            footer={
                <PopupFooter>
                    <button
                        onClick={() => reject()}
                        className={classnames(Classes.liteButton, "font-bold")}
                    >
                        Reject
                    </button>
                    <ButtonWithLoading
                        label={`${isUpdate ? "Update" : "Add"} asset`}
                        onClick={() => addToken()}
                        isLoading={isSaving}
                    />
                </PopupFooter>
            }
        >
            {isUpdate ? UpdateAssetLayout() : null}
            <div className="flex flex-row items-center px-6 py-3">
                <div className="flex flex-row items-center justify-center w-10 h-10 rounded-full bg-primary-100">
                    <img alt="icon" src={assetImageSrc()} />
                </div>
                <button
                    type="button"
                    className="relative ml-4 flex flex-col group space-y-1"
                    onClick={() => copyAssetAddress()}
                >
                    <span className="text-sm font-bold">{token.symbol}</span>
                    <span className="text-xs text-gray-600">
                        {formatHash(token.address)}
                    </span>
                    <CopyTooltip copied={copied} />
                </button>
                <div className="flex flex-col ml-auto h-full">
                    <span className="text-sm font-bold mb-auto text-center">
                        Balance
                    </span>
                    {balance === UNKNOWN_BALANCE ? (
                        <div className="flex flex-row items-end">
                            <span className="pr-1 text-xs text-gray-600">
                                Unknown
                            </span>
                            <GenericTooltip
                                bottom
                                className="right-0"
                                content={
                                    <p className="w-40 text-center">
                                        Make sure this address corresponds to a
                                        valid {capitalize(network.name)} asset.
                                    </p>
                                }
                            >
                                <AiFillQuestionCircle
                                    size={18}
                                    className="cursor-pointer text-primary-200 hover:text-primary-300"
                                />
                            </GenericTooltip>
                        </div>
                    ) : (
                        <span className="text-xs text-gray-600">
                            {balance} {token.symbol}
                        </span>
                    )}
                </div>
            </div>
            <span className="font-bold px-6 text-sm text-gray-800">
                {isUpdate ? "In " : "To "} account:
            </span>
            <div className="flex flex-col px-6 py-3">
                <div className="flex flex-row items-center space-x-4">
                    <AccountIcon
                        className="w-10 h-10"
                        fill={getAccountColor(accountData.address)}
                    />
                    <div className="relative flex flex-col group space-y-1">
                        <span className="text-sm font-bold">
                            {formatName(accountData.name, 15)}
                            {" ("}
                            {formatNumberLength(
                                formatUnits(
                                    nativeToken.balance,
                                    nativeToken.token.decimals
                                ),
                                5
                            )}
                            {` ${nativeToken.token.symbol})`}
                        </span>
                        <span className="text-xs text-gray-600">
                            {formatHash(accountData.address)}
                        </span>
                    </div>
                </div>
            </div>
            <Divider />
            <div className="flex flex-col px-6 py-3 space-y-0.5 text-sm text-gray-800 break-words">
                <span className="font-bold">Decimals</span>
                <span className="text-gray-600">{token.decimals}</span>
                {token!.image && !isBase64Image ? (
                    <>
                        <span className="font-bold pt-1">Image url</span>
                        <span className="text-gray-600 pb-1">
                            {token!.image}
                        </span>
                        <WarningTip
                            text={
                                "Your IP address will be exposed to this domain if you choose to save the image URL"
                            }
                            fontSize="text-xs"
                        />
                        <div className="pt-1 flex flex-row items-center">
                            <input
                                type="checkbox"
                                checked={isImageSaved}
                                className={Classes.checkbox}
                                onChange={() => {
                                    setIsImageSaved(!isImageSaved)
                                }}
                            />
                            <span className="text-xs pl-2">Save image URL</span>
                        </div>
                    </>
                ) : null}
                {isBase64Image && (
                    <div className="text-xs py-2">
                        <WarningTip
                            text={
                                "Blank wallet does not currently support Base64 encoded images. It will be replaced by a default image."
                            }
                            fontSize="text-xs"
                        />
                    </div>
                )}
            </div>
        </PopupLayout>
    )
}

export default WatchAssetPage
