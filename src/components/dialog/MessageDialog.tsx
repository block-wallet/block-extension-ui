import React, { FunctionComponent } from "react"
import Dialog from "./Dialog"

const MessageDialog: FunctionComponent<{
    title: string
    message: string
    open: boolean
    header?: React.ReactNode
    footer?: React.ReactNode
    onClickOutside?: () => void
}> = ({ title, message, open, header, footer, onClickOutside }) => {
    return (
        <Dialog open={open} onClickOutside={onClickOutside}>
            <>
                {header}
                <h2 className="text-lg font-bold text-center">{title}</h2>
                <div className="py-5 text-center">
                    <span className="text-sm text-gray-500">{message}</span>
                </div>
                {footer}
            </>
        </Dialog>
    )
}

export default MessageDialog
