import React, { useState } from "react"
import { useHistory } from "react-router-dom"

import PopupFooter from "../components/popup/PopupFooter"
import PopupHeader from "../components/popup/PopupHeader"
import PopupLayout from "../components/popup/PopupLayout"
import PasswordInput from "../components/input/PasswordInput"
import ConfirmDialog from "../components/dialog/ConfirmDialog"

import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "react-hook-form"
import { InferType } from "yup"

import logo from "../assets/images/logo.svg"

import { unlockApp, requestSeedPhrase } from "../context/commActions"
import { openReset } from "../context/commActions"
import { useBlankState } from "../context/background/backgroundHooks"
import { ButtonWithLoading } from "../components/button/ButtonWithLoading"

const schema = yup.object().shape({
    password: yup.string().required("Password required."),
})
type PasswordFormData = InferType<typeof schema>

const UnlockPage = () => {
    const {
        register,
        handleSubmit,
        errors,
        setError,
    } = useForm<PasswordFormData>({
        resolver: yupResolver(schema),
    })
    const history = useHistory()
    const { isSeedPhraseBackedUp, isUserNetworkOnline } = useBlankState()!
    const [hasDialog, setHasDialog] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const getSeedPhrase = async (password: any) => {
        try {
            const phrase = await requestSeedPhrase(password)
            return phrase
        } catch {
            history.push({
                pathname: "/",
            })
        }
    }
    const onSubmit = handleSubmit(async (data: PasswordFormData) => {
        try {
            setIsLoading(true)
            if (await unlockApp(data.password)) {
                if (!isSeedPhraseBackedUp) {
                    const seedPhrase = await getSeedPhrase(data.password)

                    history.push({
                        pathname: "/reminder",
                        state: {
                            seedPhrase,
                            password: data.password,
                            hasBack: false,
                        },
                    })
                } else {
                    history.push({
                        pathname: "/",
                    })
                }
            } else {
                setError("password", {
                    message: "Incorrect password",
                    shouldFocus: true,
                })
            }
            setIsLoading(false)
        } catch (e: any) {
            setError("password", {
                message: "Error unlocking the extension",
                shouldFocus: true,
            })
        }
    })

    return (
        <form className="w-full h-full" onSubmit={onSubmit}>
            <PopupLayout
                header={
                    <PopupHeader
                        title="Unlock App"
                        close={false}
                        backButton={false}
                    />
                }
                footer={
                    <PopupFooter>
                        <ButtonWithLoading
                            label="Confirm"
                            isLoading={isLoading}
                        />
                    </PopupFooter>
                }
            >
                <ConfirmDialog
                    title="Confirmation"
                    message="Are you sure you want to reset your wallet? This action can not be undone."
                    open={hasDialog}
                    onClose={() => setHasDialog(false)}
                    onConfirm={() => openReset()}
                />
                <div className="p-6 flex flex-col space-y-8">
                    <div className="flex flex-col space-y-2">
                        <img
                            src={logo}
                            alt="logo"
                            className="w-12 h-12 mx-auto"
                        />
                        <span className="text-center text-base font-bold font-title">
                            Enter your password to continue.
                        </span>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <PasswordInput
                            label="Password"
                            placeholder="Enter Password"
                            register={register}
                            error={errors.password?.message}
                            autoFocus={isUserNetworkOnline}
                        />
                        <div>
                            or&nbsp;
                            <span
                                className="rounded text-primary-300 cursor-pointer hover:underline"
                                onClick={() => setHasDialog(true)}
                            >
                                reset wallet using seed phrase
                            </span>
                        </div>
                    </div>
                </div>
            </PopupLayout>
        </form>
    )
}

export default UnlockPage
