import classnames from "classnames"
import React from "react"

const AppIcon = (props: any) => (
    <div
        className={classnames(
            "flex flex-row items-center justify-center rounded-full bg-primary-100",
            ` w-${props.size} h-${props.size}`
        )}
    >
        {props.iconURL ? (
            <img
                alt="icon"
                src={props.iconURL}
                draggable={false}
                className={
                    props.iconSize
                        ? `max-h-${props.iconSize}`
                        : `max-h-${props.size - 3}`
                }
                title={props.title}
            />
        ) : null}
    </div>
)

export default AppIcon
