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
    buttonLabel?: string
    iconColor?: string
    useClickOutside?: boolean
    wideMargins?: boolean
}> = ({
    open,
    title,
    message,
    onDone,
    buttonLabel = "OK",
    iconColor = "text-yellow-500",
    useClickOutside = true,
    wideMargins = true,
}) => {
    return (
        <MessageDialog
            header={
                <AiOutlineWarning
                    className={classnames(
                        "w-16 h-16 mb-2 block m-auto",
                        iconColor
                    )}
                />
            }
            footer={
                <>
                    <div className={wideMargins ? "-mx-6" : "-mx-3"}>
                        <Divider />
                    </div>
                    <button
                        className={classnames(Classes.liteButton, "mt-4")}
                        onClick={onDone}
                    >
                        {buttonLabel}
                    </button>
                </>
            }
            onClickOutside={useClickOutside ? onDone : undefined}
            title={title}
            message={message}
            open={open}
            wideMargins={wideMargins}
        />
    )
}

export default WarningDialog
