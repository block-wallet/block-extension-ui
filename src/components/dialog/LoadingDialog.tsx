import React from "react"
import MessageDialog from "./MessageDialog"
import Spinner from "../spinner/ThinSpinner"

export type loadingDialogProps = {
    open: boolean
    title: string
    message: string
}

const LoadingDialog = ({ open, title, message }: loadingDialogProps) => {
    return (
        <MessageDialog
            open={open}
            onClickOutside={() => {}}
            title={title}
            message={message}
            header={
                <div className="flex justify-center items-center">
                    <Spinner size="48px" />
                </div>
            }
        />
    )
}

export default LoadingDialog
