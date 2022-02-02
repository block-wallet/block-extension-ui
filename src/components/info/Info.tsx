import React, { FunctionComponent } from "react"
import CheckmarkCircle from "../icons/CheckmarkCircle"
import ExclamationCircleIconFull from "../icons/ExclamationCircleIconFull"
import classnames from "classnames"

interface InfoItemProps {
    type: "success" | "warn"
    className?: string
}

interface InfoComponents {
    Item: FunctionComponent<InfoItemProps>
    Title: FunctionComponent
    List: FunctionComponent
}

const Info: FunctionComponent & InfoComponents = ({ children }) => {
    return <div>{children}</div>
}

const Title: FunctionComponent = ({ children }) => {
    return (
        <span className="text-2xl font-bold leading-10 font-title">
            {children}
        </span>
    )
}

const InfoList: FunctionComponent = ({ children }) => {
    return <ul className="list-none">{children}</ul>
}

const BulletType = {
    success: () => <CheckmarkCircle size="24" />,
    warn: () => <ExclamationCircleIconFull size="24" />,
}

const Item: FunctionComponent<InfoItemProps> = ({
    children,
    type,
    className,
}) => {
    const Bullet = BulletType[type]
    return (
        <li className={classnames("mb-5 flex items-start", className || "")}>
            <div className="flex-none mr-3 mt-0.5">
                <Bullet />
            </div>
            <span className="flex-1 text-sm text-slate-600 leading-6">
                {children}
            </span>
        </li>
    )
}

Info.Item = Item
Info.Title = Title
Info.List = InfoList

export default Info
