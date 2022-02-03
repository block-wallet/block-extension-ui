import classnames from "classnames"
import React, { FunctionComponent } from "react"
import { AiOutlineWarning } from "react-icons/ai"
import { Classes } from "../../styles"
import Divider from "../Divider"
import MessageDialog from "./MessageDialog"

const WarningDialog: FunctionComponent<{
    open: boolean
    title: string
    message: string
    onDone: () => void
}> = ({ open, title, message, onDone }) => {
    return (
        <MessageDialog
            header={
                <AiOutlineWarning className="text-yellow-500 w-16 h-16 mb-2 block m-auto" />
            }
            footer={
                <>
                    <div className="-mx-6">
                        <Divider />
                    </div>
                    <button
                        className={classnames(Classes.liteButton, "mt-4")}
                        onClick={onDone}
                    >
                        OK
                    </button>
                </>
            }
            onClickOutside={onDone}
            title={title}
            message={message}
            open={open}
        />
    )
}

export default WarningDialog
