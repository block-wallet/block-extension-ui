import React, { useState } from "react"
import classnames from "classnames"
import PopupFooter from "../../components/popup/PopupFooter"
import PopupHeader from "../../components/popup/PopupHeader"
import PopupLayout from "../../components/popup/PopupLayout"
import { DappReq, useDappRequest } from "../../context/hooks/useDappRequest"
import { confirmDappRequest } from "../../context/commActions"
import {
    DappRequestParams,
    DappSignatureReq,
    NormalizedSwitchEthereumChainParameters,
    RawSignatureData,
    WatchAssetReq,
} from "@blank/background/utils/types/ethereum"
import { useSelectedNetwork } from "../../context/hooks/useSelectedNetwork"
import InfoComponent from "../../components/InfoComponent"
import { CgArrowsExchangeV } from "react-icons/cg"
import { getNetworkFromChainId } from "../../util/getExplorer"
import { useBlankState } from "../../context/background/backgroundHooks"
import { ButtonWithLoading } from "../../components/button/ButtonWithLoading"
import ErrorMessage from "../../components/error/ErrorMessage"
import { SiteMetadata } from "@blank/provider/types"
import { Redirect } from "react-router-dom"
import useNextRequestRoute from "../../context/hooks/useNextRequestRoute"
import { Classes } from "../../styles"

const NetworkComponent = ({
    network,
    iconColor,
    className,
}: {
    network: string
    iconColor: string
    className?: string
}) => {
    return (
        <div
            className={classnames(
                "w-3/6 mx-20 relative flex flex-row items-center justify-center p-1 px-4 pr-1 text-gray-600 rounded-xl group border border-primary-200 text-xs",
                className
            )}
        >
            <span
                className={`relative inline-flex rounded-full -ml-2 h-2 w-2 mr-2 animate-pulse ${iconColor} pointer-events-none`}
            ></span>
            <span>{network}</span>
        </div>
    )
}

const SwitchEthereumChainPage = () => {
    const dappRequest = useDappRequest()
    const route = useNextRequestRoute()

    return typeof dappRequest !== "undefined" &&
        dappRequest.type === DappReq.SWITCH_NETWORK ? (
            <SwitchEthereumChain
            requestId={dappRequest.requestId}
            origin={dappRequest.origin}
            reqSiteMetadata={dappRequest.siteMetadata}
            dappReqData={dappRequest.dappReqData}
        />
    ) : (
        <Redirect to={route} />
    )
}

const SwitchEthereumChain = ({
    requestId,
    reqSiteMetadata,
    dappReqData,
}: {
    dappReqData:
        | Record<string, unknown>
        | DappSignatureReq<keyof RawSignatureData>
        | NormalizedSwitchEthereumChainParameters
        | WatchAssetReq
    requestId: string
    origin: string
    reqSiteMetadata: SiteMetadata
}) => {
    const { availableNetworks } = useBlankState()!
    const { chainId: currentNetworkChainId } = useSelectedNetwork()

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | undefined>(undefined)

    // Get the network names
    const {
        chainId: newNetworkChainId,
    } = dappReqData as DappRequestParams[DappReq.SWITCH_NETWORK]

    const [currentNetworkName] = useState(
        getNetworkFromChainId(availableNetworks, currentNetworkChainId, "desc")
    )
    const [newNetworkName] = useState(
        getNetworkFromChainId(availableNetworks, newNetworkChainId, "desc")
    )

    const [siteMetadata] = useState(reqSiteMetadata)

    const approve = async () => {
        try {
            setIsLoading(true)
            await confirmDappRequest(requestId, true)
            await new Promise((resolve) => setTimeout(resolve, 400))
        } catch (err) {
            setError(err.message)
            setIsLoading(false)
        }
    }

    const reject = () => {
        confirmDappRequest(requestId, false)
    }

    return (
        <PopupLayout
            header={
                <PopupHeader
                    icon={siteMetadata.iconURL}
                    title={siteMetadata.name}
                    close={false}
                    backButton={false}
                />
            }
            footer={
                <PopupFooter>
                    <button
                        onClick={reject}
                        className={classnames(
                            Classes.liteButton,
                            isLoading && "opacity-50 pointer-events-none"
                        )}
                    >
                        Reject
                    </button>
                    <ButtonWithLoading
                        onClick={approve}
                        isLoading={isLoading}
                        label="Switch"
                    ></ButtonWithLoading>
                </PopupFooter>
            }
        >
            <div className="flex flex-col p-6 space-y-4 h-full justify-between">
                {/* Header */}
                <div className="flex flex-col space-y-2 text-sm">
                    <span className="font-bold text-black">
                        Allow this site to switch the network?
                    </span>
                    <span className="text-gray-500">
                        This will switch the selected network within Blank
                        Wallet to a previously added network:
                    </span>
                </div>

                <div className="flex flex-col space-y-6">
                    {/* Current network */}
                    <NetworkComponent
                        iconColor="bg-green-500"
                        network={currentNetworkName}
                    />

                    {/* Switch Line */}
                    <div className="flex flex-row items-center justify-center">
                        <div
                            className="absolute border-t z-0"
                            style={{ width: "calc(100%)" }}
                        ></div>
                        {/* Arrow icon */}
                        <div className="flex flex-row items-center justify-center w-9 h-9 p-1.5 bg-white border border-gray-200 rounded-full z-0">
                            <CgArrowsExchangeV fontStyle="bold" fontSize="48" />
                        </div>
                    </div>

                    {/* New network */}
                    <NetworkComponent
                        iconColor="bg-blue-500"
                        network={newNetworkName}
                    />
                </div>
                {/* Info component */}
                <InfoComponent className="mt-12">
                    Switching networks will cancel all pending confirmations
                </InfoComponent>
                <ErrorMessage error={error} />
            </div>
        </PopupLayout>
    )
}

export default SwitchEthereumChainPage
