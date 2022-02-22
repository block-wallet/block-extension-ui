import React, { FunctionComponent, useLayoutEffect } from "react"
import { rejectUnconfirmedRequests } from "../../context/commActions"
import useBeforeunload from "../../context/hooks/useBeforeUnload"
import usePreventWindowResize from "../../context/hooks/usePreventWindowResize"
import { isAutomaticClose } from "../../context/setup"
import PageLayout from "../PageLayout"

const PopupLayout: FunctionComponent<{
    header?: React.ReactNode
    footer?: React.ReactNode
}> = ({ header, children, footer }) => {
    const { preventResize, cancelPreventResize } = usePreventWindowResize()
    const fullHeader = (
        <>
            {header}
            <hr className="border-0.5 border-gray-200 w-full" />
        </>
    )

    useBeforeunload(() => {
        if (!isAutomaticClose) {
            rejectUnconfirmedRequests()
        }
    })

    useLayoutEffect(() => {
        preventResize()
        return () => cancelPreventResize()
    }, [preventResize, cancelPreventResize])

    return (
        <PageLayout screen className="max-h-screen popup-layout">
            <div className="absolute top-0 left-0 w-full">{fullHeader}</div>
            <div className="invisible w-full">{fullHeader}</div>
            <div className="flex-1 flex flex-col w-full h-0 max-h-screen overflow-auto main-content">
                {children}
            </div>
            {footer ? (
                <>
                    <hr className="border-0.5 border-gray-200 w-full" />
                    {footer}
                </>
            ) : null}
        </PageLayout>
    )
}

export default PopupLayout
