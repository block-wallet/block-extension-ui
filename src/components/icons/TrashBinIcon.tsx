import React, { FunctionComponent } from 'react'

const TrashBinIcon: FunctionComponent<{ fill?: string }> = ({ fill = 'black' }) => {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d="M7 7H5V13H7V7Z" fill={fill} />
            <path d="M11 7H9V13H11V7Z" fill={fill} />
            <path
                d="M12 1C12 0.4 11.6 0 11 0H5C4.4 0 4 0.4 4 1V3H0V5H1V15C1 15.6 1.4 16 2 16H14C14.6 16 15 15.6 15 15V5H16V3H12V1ZM6 2H10V3H6V2ZM13 5V14H3V5H13Z"
                fill={fill}
            />
        </svg>
    )
}

export default TrashBinIcon
