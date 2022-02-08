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
                <h2 className="text-lg font-bold text-center">{title}</h2>
                <div className="p-5 flex">
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
