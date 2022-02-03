import React, { FunctionComponent, useState } from "react"

import { Link } from "react-router-dom"
import Divider from "../../components/Divider"
import { Classes, classnames } from "../../styles/classes"

import crossIcon from "../../assets/images/icons/cross.svg"

import checkmarkIcon from "../../assets/images/icons/checkmark.svg"
import PageLayout from "../../components/PageLayout"
import WarningTip from "../../components/label/WarningTip"

const SetupOption: FunctionComponent<{
    title: string
    description: string
    icon: string
    linkTo: string
    linkLabel: string
}> = ({ title, description, icon, linkTo, linkLabel }) => (
    <div className="relative flex flex-col items-start flex-1 p-6 bg-primary-100">
        <div className="absolute top-0 right-0 w-4 h-4 bg-white" />
        <div className="absolute top-0 right-0 w-4 h-4 mt-4 mr-4 bg-white" />
        <img
            src={icon}
            alt="icon"
            className="mb-4 text-4xl text-gray-500 w-14 h-14"
        />
        <span className="text-sm font-bold font-title">{title}</span>
        <span className="h-16 mt-4 text-xs text-gray-500">{description}</span>
        <Link
            to={linkTo}
            className={classnames(Classes.button, "w-full")}
            draggable={false}
        >
            {linkLabel}
        </Link>
    </div>
)

const SetupPage = () => (
    <>
        <PageLayout className="relative" header>
            <span className="my-6 text-lg font-bold font-title">
                New to BlockWallet?
            </span>
            <Divider />
            <div className="flex flex-col w-full p-6 space-y-4 md:flex-row md:space-y-0 md:space-x-4">
                <SetupOption
                    title="No, I have a seed phrase"
                    description="Import your existing wallet using a 12 word seed phrase."
                    icon={crossIcon}
                    linkTo="/setup/import"
                    linkLabel="Import Your Wallet"
                />
                <SetupOption
                    title="Yes, set me up"
                    description="Create a new wallet and seed phrase."
                    icon={checkmarkIcon}
                    linkTo="/setup/create"
                    linkLabel="Create a Wallet"
                />
            </div>
        </PageLayout>
        <WarningModal />
    </>
)

const WarningModal = () => {
    const [isOpen, setIsOpen] = useState(true)

    return (
        <div
            className={classnames(
                "modal absolute w-full h-full top-0 left-0 flex items-center justify-center",
                isOpen ? "opacity-1" : "opacity-0 hidden"
            )}
        >
            <div className="modal-overlay absolute w-full h-full bg-blue-100 opacity-50"></div>
            <div className="modal-container  bg-white w-11/12 md:max-w-lg mx-auto rounded shadow-lg z-50 overflow-y-auto">
                <div className="modal-content p-8 text-left">
                    <WarningTip
                        withCloseIcon={false}
                        text="Warning! Private Beta version."
                    />
                    <p className="text-xs text-gray-600 leading-6 p-8 mb-6 text-center">
                        This version is an experimental private beta version. Do
                        not import your main wallet's seed phrase and proceed
                        with caution. Use on your own risk.
                    </p>
                    <div className="flex items-center w-1/2 m-auto">
                        <button
                            type="button"
                            className={classnames(Classes.liteButton)}
                            onClick={() => setIsOpen(false)}
                        >
                            I understand
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SetupPage
