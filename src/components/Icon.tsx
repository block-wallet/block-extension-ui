import React, { FunctionComponent } from "react"

import Lottie from "react-lottie"

import successImg from "../assets/images/icons/checkmark_notes.svg"
import successAnim from "../assets/images/icons/checkmark_notes.json"
import confirmationCheck from "../assets/images/icons/confirmation_check.json"
import confirmationCheckImg from "../assets/images/icons/confirmation_check.svg"

export enum IconNames {
    Success,
    ConfirmationCheck,
}

type IconType = { img: string; anim: any }
const icons: { [icon: number]: IconType } = {
    [IconNames.Success]: { img: successImg, anim: successAnim },
    [IconNames.ConfirmationCheck]: {
        img: confirmationCheckImg,
        anim: confirmationCheck,
    },
}

const Icon: FunctionComponent<{
    icon: IconNames
    className?: string
    animated?: boolean
}> = ({ icon, className, animated = false }) =>
    animated ? (
        <div className={className}>
            <Lottie
                options={{
                    animationData: icons[icon].anim,
                    autoplay: true,
                    rendererSettings: {
                        preserveAspectRatio: "xMidYMid slice",
                    },
                    loop: false,
                }}
                width="100%"
                height="100%"
            />
        </div>
    ) : (
        <img src={icons[icon].img} alt="checkmark" className={className} />
    )

export default Icon
