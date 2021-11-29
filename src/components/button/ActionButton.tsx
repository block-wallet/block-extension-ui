import classnames from "classnames"
import React, { FunctionComponent } from "react"
import { Link } from "react-router-dom"
import { Classes } from "../../styles"

export const ActionButton: FunctionComponent<{
    icon: string
    label: string
    to: string
}> = ({ icon, label, to }) => {
    return (
        <Link className={classnames(Classes.actionButton)} to={to}>
            <img
                src={icon}
                alt={label}
                className={classnames(Classes.buttonIcon)}
            />
            {label}
        </Link>
    )
}
