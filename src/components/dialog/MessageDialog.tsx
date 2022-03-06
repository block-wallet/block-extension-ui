import React, { FunctionComponent } from "react"
import { classnames } from "../../styles"
import Dialog from "./Dialog"

export type messageDialogProps = {
    title: string
    message: string
    open: boolean
    header?: React.ReactNode
    footer?: React.ReactNode
    onClickOutside?: () => void
    wideMargins?: boolean
}

const MessageDialog: FunctionComponent<messageDialogProps> = ({
    title,
    message,
    open,
    header,
    footer,
    onClickOutside,
    wideMargins = true,
}) => {
    return (
        <Dialog
            open={open}
            onClickOutside={onClickOutside}
            horizontalPadding={wideMargins ? "px-6" : "px-3"}
        >
            <>
                {header}
                <h2 className="text-lg font-bold text-center mt-4">{title}</h2>
                <div
                    className={classnames(
                        "flex mt-2 mb-4",
                        wideMargins ? "px-5 " : "px-1"
                    )}
                >
                    <span className="text-sm text-center w-full text-gray-500">
                        {message}
                    </span>
                </div>
                {footer}
            </>
        </Dialog>
    )
}

export default MessageDialog
