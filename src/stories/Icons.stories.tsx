import React from "react"
import { Meta } from "@storybook/react"
import Icon, { IconNames } from "../components/Icon"

export const SuccessIcon = () => (
    <Icon icon={IconNames.Success} className="w-24 h-24" />
)
export const SuccessIconAnimated = () => (
    <Icon icon={IconNames.Success} className="w-24 h-24" animated />
)

export const ConfirmationCheck = () => (
    <Icon icon={IconNames.ConfirmationCheck} className="w-24 h-24" />
)

export const ConfirmationCheckAnimated = () => (
    <Icon icon={IconNames.ConfirmationCheck} className="w-24 h-24" animated />
)
export default { title: "Icons" } as Meta
