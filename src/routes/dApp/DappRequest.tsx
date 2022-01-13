import type {
    DappSignatureReq,
    NormalizedSwitchEthereumChainParameters,
    RawSignatureData,
    WatchAssetReq,
} from "@blank/background/utils/types/ethereum"
import React, { useState, useRef, FunctionComponent } from "react"
import useNextRequestRoute from "../../context/hooks/useNextRequestRoute"
import { DappReq, useDappRequest } from "../../context/hooks/useDappRequest"
import { Redirect } from "react-router"
import { SiteMetadata } from "@blank/provider/types"

export interface DappRequestProps {
    dappReqData:
        | DappSignatureReq<keyof RawSignatureData>
        | NormalizedSwitchEthereumChainParameters
        | Record<string, unknown>
        | WatchAssetReq
    origin: string
    requestCount: number
    requestId: string
    siteMetadata: SiteMetadata
    isConfirming: boolean
    setIsConfirming: (v: boolean) => void
}

export const DappRequest: FunctionComponent<{
    requestType: DappReq
    layoutRender: React.FunctionComponent<DappRequestProps>
}> = ({ requestType, layoutRender }) => {
    const latestDappRequest = useDappRequest()
    const route = useNextRequestRoute()
    const [isConfirming, setIsConfirming] = useState(false)
    const dappRequest = useRef(latestDappRequest)
    const setConfirm = (v: boolean) => {
        setIsConfirming(v)
    }

    // Update dappRequest if it's not confirming
    if (!isConfirming) {
        dappRequest.current = latestDappRequest
    }

    if (
        typeof dappRequest.current === "undefined" ||
        dappRequest.current.type !== requestType
    ) {
        return <Redirect to={route} />
    }

    return layoutRender({
        dappReqData: dappRequest.current.dappReqData,
        origin: dappRequest.current.origin,
        requestCount: dappRequest.current.requestCount,
        requestId: dappRequest.current.requestId,
        siteMetadata: dappRequest.current.siteMetadata,
        isConfirming: isConfirming,
        setIsConfirming: setConfirm,
    })
}
