import classnames from 'classnames'
import React from 'react'

const AppIcon = (props: any) => (
    <div className={classnames(
        'flex flex-row items-center justify-center rounded-full bg-primary-100',
        ` w-${props.size} h-${props.size}`
    )}>
        {props.iconURL ? <img alt="icon" src={props.iconURL} className={`max-h-${props.size - 3}`} /> : null}
    </div>
)

export default AppIcon
