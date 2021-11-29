import classnames from "classnames"
import React, { FunctionComponent } from "react"
import { useOnMountHistory } from "../../context/hooks/useOnMount"
import AppIcon from "../icons/AppIcon"

import CloseIcon from "../icons/CloseIcon"
import ArrowIcon from "../icons/ArrowIcon"
import { useLastLocation } from "react-router-last-location"

const PopupHeader: FunctionComponent<{
    title: string
    backButton?: boolean
    keepState?: boolean // if true, keeps the previous state while going back using the back button
    close?: string | boolean
    icon?: string | null
    onClose?: () => void
    onBack?: () => void // in case we want to replace default back behavior
}> = ({
    title,
    backButton = true,
    keepState = false,
    close = "/home",
    icon,
    children,
    onClose,
    onBack,
}) => {
    const history = useOnMountHistory()
    const lastLocation = useLastLocation()
    return (
        <div
            className="z-10 flex flex-row items-center p-6 bg-white bg-opacity-75 max-w-full"
            style={{ backdropFilter: "blur(4px)", minHeight: "76px" }}
        >
            {backButton && (
                <button
                    type="button"
                    onClick={() => {
                        onBack
                            ? onBack()
                            : keepState
                            ? history.push({
                                  pathname: lastLocation?.pathname,
                                  state: lastLocation?.state && {
                                      keepState: true,
                                  },
                              })
                            : history.goBack()
                    }}
                    className="p-2 -ml-2 mr-1 cursor-pointer transition duration-300 rounded-full hover:bg-primary-100 hover:text-primary-300"
                >
                    <ArrowIcon />
                </button>
            )}
            {icon && (
                <div className="pr-3">
                    <AppIcon iconURL={icon} size={10} />
                </div>
            )}
            <span
                title={title}
                className={classnames(
                    "text-base font-bold truncate ...",
                    icon && "w-56"
                )}
            >
                {title}
            </span>
            {close && (
                <button
                    onClick={() => {
                        onClose && onClose()
                        //history.push(close.toString())
                        // close button always returns to home now. TBD if we want to return to the beginning of each flow
                        history.push("/home")
                    }}
                    className="p-2 ml-auto -mr-2 text-gray-900 transition duration-300 rounded-full hover:bg-primary-100 hover:text-primary-300"
                >
                    <CloseIcon />
                </button>
            )}
            {children}
        </div>
    )
}

export default PopupHeader
