import React, { useRef, useState } from "react"

import PopupHeader from "../../components/popup/PopupHeader"
import PopupLayout from "../../components/popup/PopupLayout"
import PopupFooter from "../../components/popup/PopupFooter"
import TextInput from "../../components/input/TextInput"
import WaitingDialog, {
    useWaitingDialog,
} from "../../components/dialog/WaitingDialog"

import * as yup from "yup"
import { InferType } from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "react-hook-form"

import { createAccount } from "../../context/commActions"
import { useBlankState } from "../../context/background/backgroundHooks"
import { useOnMountHistory } from "../../context/hooks/useOnMount"
import { ButtonWithLoading } from "../../components/button/ButtonWithLoading"

const createAccountSchema = yup.object().shape({
    accountName: yup.string().max(40, "Account name is too long"),
})
type createAccountFormData = InferType<typeof createAccountSchema>

const WithdrawBlankCreateAccount = () => {
    const history: any = useOnMountHistory()
    const { pair, preSelectedAsset } = history.location.state
    const {
        register,
        handleSubmit,
        errors,
        setError,
    } = useForm<createAccountFormData>({
        resolver: yupResolver(createAccountSchema),
    })
    const { accounts } = useBlankState()!
    const accountNumber = Object.keys(accounts).length + 1
    const placeholderAccountName = useRef(`Account ${accountNumber}`)
    const { isOpen, status, dispatch } = useWaitingDialog()
    const createdAccountAddressRef = useRef("")

    const onSubmit = handleSubmit(async (data: createAccountFormData) => {
        try {
            dispatch({ type: "open", payload: { status: "loading" } })

            const newAccount = await createAccount(
                data.accountName
                    ? data.accountName
                    : placeholderAccountName.current
            )

            createdAccountAddressRef.current = newAccount.address

            dispatch({ type: "setStatus", payload: { status: "success" } })
        } catch {
            setError("accountName", {
                message: "Error creating account.",
                shouldFocus: true,
            })
            dispatch({ type: "setStatus", payload: { status: "error" } })
        }
    })

    return (
        <>
            <WaitingDialog
                status={status}
                open={isOpen}
                titles={{
                    loading: "Fetching balances...",
                    error: "Error",
                    success: "Success!",
                }}
                texts={{
                    loading: `Please wait while your account is being created...`,
                    error: "An error happened while creating the account.",
                    success: `Congratulations! Your account is created!`,
                }}
                onDone={() => {
                    if (!!errors.accountName) {
                        dispatch({ type: "close" })
                        return
                    }

                    if (createdAccountAddressRef.current === "")
                        throw new Error("Account address is not set")

                    history.push({
                        pathname:
                            "/privacy/withdraw/block/accounts/step/confirm",
                        state: {
                            address: createdAccountAddressRef.current,
                            pair,
                            preSelectedAsset,
                        },
                    })
                }}
                timeout={1000}
            />
            <form className="w-full h-full" onSubmit={onSubmit}>
                <PopupLayout
                    header={
                        <PopupHeader
                            title="Withdraw From Privacy Pool"
                            onBack={() => {
                                history.push({
                                    pathname:
                                        "/privacy/withdraw/block/accounts",
                                    state: { pair, preSelectedAsset },
                                })
                            }}
                        />
                    }
                    footer={
                        <PopupFooter>
                            <ButtonWithLoading
                                type="submit"
                                label="Create"
                                isLoading={status === "loading" && isOpen}
                            />
                        </PopupFooter>
                    }
                >
                    <div className="flex flex-col p-6 space-y-1">
                        <TextInput
                            appearance="outline"
                            label="Account Name"
                            placeholder={placeholderAccountName.current}
                            name="accountName"
                            register={register}
                            error={errors.accountName?.message}
                        />
                    </div>
                </PopupLayout>
            </form>
        </>
    )
}

export default WithdrawBlankCreateAccount
