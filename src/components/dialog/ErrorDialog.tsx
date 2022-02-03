import React, { FunctionComponent } from "react"
import { CgDanger } from "react-icons/cg"
import classnames from "classnames"

import MessageDialog, { messageDialogProps } from "./MessageDialog"
import Divider from "../Divider"

import { Classes } from "../../styles"

type ErrorDialogProps = messageDialogProps & {
    onClickButton: React.MouseEventHandler<HTMLButtonElement>
}

const ErrorDialog: FunctionComponent<ErrorDialogProps> = ({
    title,
    message,
    open,
    onClickOutside,
    onClickButton,
}) => {
    return (
        <MessageDialog
            title={title}
            message={message}
            open={open}
            onClickOutside={onClickOutside}
            header={
                <CgDanger className="text-red-500 w-20 h-20 mb-2 block m-auto" />
            }
            footer={
                <>
                    <div className="-mx-6">
                        <Divider />
                    </div>
                    <button
                        className={classnames(Classes.liteButton, "mt-4")}
                        onClick={onClickButton}
                    >
                        OK
                    </button>
                </>
            }
        />
    )
}

export default ErrorDialog
