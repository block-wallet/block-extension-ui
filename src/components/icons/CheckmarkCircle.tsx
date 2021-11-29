import React from 'react'

type CheckmarkCircleType = {
    color?: string
    animate?: boolean
    classes?: string
}

const CheckmarkCircle = (props: CheckmarkCircleType) => {
    const { color = '#3CBF88', classes = '' } = props

    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={classes}
        >
            <path
                d="M8 0C3.6 0 0 3.6 0 8C0 12.4 3.6 16 8 16C12.4 16 16 12.4 16 8C16 3.6 12.4 0 8 0ZM7 11.4L3.6 8L5 6.6L7 8.6L11 4.6L12.4 6L7 11.4Z"
                fill={color}
            />
        </svg>
    )
}

export default CheckmarkCircle