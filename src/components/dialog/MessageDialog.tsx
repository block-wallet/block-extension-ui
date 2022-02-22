import React, { FunctionComponent } from "react"
import Dialog from "./Dialog"

export type messageDialogProps = {
    title: string
    message: string
    open: boolean
    header?: React.ReactNode
    footer?: React.ReactNode
    onClickOutside?: () => void
}

const MessageDialog: FunctionComponent<messageDialogProps> = ({
    title,
    message,
    open,
    header,
    footer,
    onClickOutside,
}) => {
    return (
        <Dialog open={open} onClickOutside={onClickOutside}>
            <>
                {header}
                <h2 className="text-lg font-bold text-center mt-4">{title}</h2>
                <div className="px-5 flex mt-2 mb-4">
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
