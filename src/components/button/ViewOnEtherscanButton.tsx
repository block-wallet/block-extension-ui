import React, { FunctionComponent } from "react"
import openIcon from "../../assets/images/icons/open_external.svg"
import { useBlankState } from "../../context/background/backgroundHooks"
import { generateExplorerLink, getExplorerName } from "../../util/getExplorer"

export const ViewOnEtherscanButton: FunctionComponent<{
    type?: "tx" | "address"
    hash: string
}> = ({ type = "tx", hash }) => {
    const { selectedNetwork, availableNetworks } = useBlankState()!
    const explorerName = getExplorerName(availableNetworks, selectedNetwork)
    return (
        <a
            className="flex flex-row items-center justify-start py-4 px-4 mt-4 w-full space-x-2 bg-primary-100 rounded-md text-black text-sm font-bold hover:bg-primary-200"
            href={generateExplorerLink(
                availableNetworks,
                selectedNetwork,
                hash,
                type
            )}
            target="_blank"
            rel="noopener noreferrer"
        >
            <img src={openIcon} alt="visit" className="w-5 h-5 mr-1" />
            <span>View on {explorerName}</span>
        </a>
    )
}
