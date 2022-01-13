import React, { FunctionComponent, useState } from "react"
import PopupFooter from "../../components/popup/PopupFooter"
import PopupHeader from "../../components/popup/PopupHeader"
import PopupLayout from "../../components/popup/PopupLayout"
import { Classes } from "../../styles/classes"
import Divider from "../../components/Divider"
import { formatHash, formatName } from "../../util/formatAccount"
import { formatUnits } from "ethers/lib/utils"
import { formatUrl } from "../../util/formatUrl"
import { DappReq } from "../../context/hooks/useDappRequest"
import ReactJson from "react-json-view"
import { confirmDappRequest } from "../../context/commActions"
import { useBlankState } from "../../context/background/backgroundHooks"
import {
    EIP712Domain,
    EIP712DomainKey,
    MessageSchema,
    NormalizedSignatureData,
    SignatureTypes,
    TypedMessage,
    V1TypedData,
    DappRequestParams,
} from "@blank/background/utils/types/ethereum"
import { AiFillInfoCircle } from "react-icons/ai"
import Tooltip from "../../components/label/Tooltip"
import { getNetworkFromChainId } from "../../util/getExplorer"
import { useSelectedNetwork } from "../../context/hooks/useSelectedNetwork"
import { capitalize } from "../../util/capitalize"
import AccountIcon from "../../components/icons/AccountIcon"
import { getAccountColor } from "../../util/getAccountColor"
import { formatNumberLength } from "../../util/formatNumberLength"
import CopyTooltip from "../../components/label/СopyToClipboardTooltip"
import { useTokensList } from "../../context/hooks/useTokensList"
import { ButtonWithLoading } from "../../components/button/ButtonWithLoading"
import { DappRequestProps, DappRequest } from "./DappRequest"
import SuccessDialog from "../../components/dialog/SuccessDialog"
import LoadingOverlay from "../../components/LoadingOverlay"

const SignPage = () => {
    return (
        <DappRequest
            requestType={DappReq.SIGNING}
            layoutRender={(props: DappRequestProps) => {
                return <Sign {...props} />
            }}
        />
    )
}

const Sign: FunctionComponent<DappRequestProps> = ({
    requestCount,
    requestId,
    origin,
    siteMetadata,
    dappReqData,
    isConfirming,
    setIsConfirming,
}) => {
    const network = useSelectedNetwork()
    const { accounts, availableNetworks } = useBlankState()!
    const { nativeToken } = useTokensList()
    const [copied, setCopied] = useState(false)
    const [showDialog, setShowDialog] = useState(false)

    const {
        method,
        params: dappReqParams,
    } = dappReqData as DappRequestParams[DappReq.SIGNING]

    const websiteIcon = siteMetadata.iconURL
    const { address, data } = dappReqParams
    const accountData = accounts[address]

    const sign = async () => {
        try {
            setIsConfirming(true)
            await confirmDappRequest(requestId, true)
            await new Promise((resolve) => setTimeout(resolve, 600))
        } finally {
            setIsConfirming(false)
        }
    }

    const reject = async () => {
        try {
            setIsConfirming(true)
            await confirmDappRequest(requestId, false)
            await new Promise((resolve) => setTimeout(resolve, 600))
        } finally {
            setIsConfirming(false)
        }
    }

    const copy = async () => {
        await navigator.clipboard.writeText(accountData.address)
        setCopied(true)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setCopied(false)
    }

    const formatTypedDomain = (domain: EIP712Domain) => {
        const displayOrder: EIP712DomainKey[] = [
            "name",
            "version",
            "chainId",
            "verifyingContract",
            "salt",
        ]

        const formattedDomainKeyNames: { [key in EIP712DomainKey]: string } = {
            chainId: "Chain ID",
            name: "DApp",
            salt: "Salt",
            verifyingContract: "Verifying Contract",
            version: "Version",
        }

        let parsedDomain = []

        // Arrayifi(lol) domain following the display order
        for (let i = 0; i < displayOrder.length; i++) {
            // Check existing properties on the domain
            if (
                typeof domain[displayOrder[i]] === "string" ||
                typeof domain[displayOrder[i]] === "number"
            ) {
                parsedDomain[i] = `${domain[displayOrder[i]]}`
            } else {
                parsedDomain[i] = null
            }
        }

        // Add chain id name if it exists
        if (domain.chainId) {
            const networkName = getNetworkFromChainId(
                availableNetworks,
                domain.chainId
            )
            parsedDomain[2] += ` (${networkName})`
        }

        // Display them
        return parsedDomain.map((param: string | null, i: number) => {
            if (param) {
                return (
                    <>
                        <span className="font-bold pt-1">
                            {formattedDomainKeyNames[displayOrder[i]]}
                        </span>
                        <span className="text-gray-600">{param}</span>
                    </>
                )
            } else {
                return null
            }
        })
    }

    const formatSignatureData = (
        method: SignatureTypes,
        data: NormalizedSignatureData[SignatureTypes]
    ) => {
        if (method === "personal_sign") {
            return (
                <>
                    <span className="font-bold py-2">Message</span>
                    <span className="text-gray-600">{data}</span>
                </>
            )
        } else if (
            method === "eth_signTypedData" ||
            method === "eth_signTypedData_v1"
        ) {
            const v1Data = data as V1TypedData[]
            return (
                <>
                    {v1Data.map((param: V1TypedData) => {
                        return (
                            <>
                                <span className="font-bold pt-1">
                                    {param.name}
                                </span>
                                <span className="text-gray-600">
                                    {`${param.value}`}
                                </span>
                            </>
                        )
                    })}
                </>
            )
        } else {
            const v4Data = data as TypedMessage<MessageSchema>
            return (
                <>
                    {formatTypedDomain(v4Data.domain)}
                    <span className="font-bold py-1">Message</span>
                    <ReactJson
                        src={v4Data.message}
                        name={null}
                        indentWidth={1}
                        enableClipboard={false}
                        iconStyle={"triangle"}
                        displayObjectSize={false}
                        displayDataTypes={false}
                        quotesOnKeys={false}
                    />
                </>
            )
        }
    }

    return (
        <PopupLayout
            header={
                <PopupHeader
                    title="Signature Request"
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
                    <ButtonWithLoading
                        onClick={reject}
                        buttonClass={Classes.liteButton}
                        isLoading={isConfirming}
                        label="Reject"
                    ></ButtonWithLoading>
                    <ButtonWithLoading
                        label="Sign"
                        onClick={() => setShowDialog(true)}
                        isLoading={isConfirming}
                    />
                </PopupFooter>
            }
        >
            <SuccessDialog
                open={showDialog}
                title="Success"
                message="You've signed the request."
                timeout={1200}
                onDone={() => {
                    setShowDialog(false)
                    sign()
                }}
            />
            <div className="flex flex-col px-6 py-3">
                {isConfirming && <LoadingOverlay />}
                <div className="flex flex-row items-center space-x-4">
                    <div className="flex flex-row items-center justify-center w-10 h-10 rounded-full bg-primary-100">
                        {websiteIcon ? (
                            <img alt="icon" src={websiteIcon} />
                        ) : null}
                    </div>
                    <div className="flex flex-col space-y-1">
                        <span className="text-sm font-bold">
                            {formatUrl(origin)}
                        </span>
                    </div>
                </div>
            </div>
            <Divider />
            <span className="font-bold px-6 py-3 text-sm text-gray-800">
                Signing Account
            </span>
            <div className="flex flex-col px-6">
                <div className="flex flex-row items-center space-x-4">
                    <AccountIcon
                        className="w-10 h-10"
                        fill={getAccountColor(accountData.address)}
                    />
                    <button
                        type="button"
                        className="relative flex flex-col group space-y-1"
                        onClick={copy}
                    >
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
                        <CopyTooltip copied={copied} />
                    </button>
                </div>
            </div>
            <div className="flex flex-col px-6 py-3 space-y-0.5 text-sm text-gray-800 break-all">
                {formatSignatureData(method as SignatureTypes, data)}
            </div>
        </PopupLayout>
    )
}

export default SignPage
