import React, { useState } from "react"

import { Classes } from "../../styles/classes"
import classnames from "classnames"

import PopupHeader from "../../components/popup/PopupHeader"
import PopupLayout from "../../components/popup/PopupLayout"
import PopupFooter from "../../components/popup/PopupFooter"
import LinkButton from "../../components/button/LinkButton"
import TextInput from "../../components/input/TextInput"

import * as yup from "yup"
import { InferType } from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "react-hook-form"

import { createAccount } from "../../context/commActions"
import { useBlankState } from "../../context/background/backgroundHooks"
import { useOnMountHistory } from "../../context/hooks/useOnMount"
import Spinner from "../../components/Spinner"

const createAccountSchema = yup.object().shape({
    accountName: yup.string().max(40, "Account name is too long"),
})
type createAccountFormData = InferType<typeof createAccountSchema>

const WithdrawBlankCreateAccount = () => {
    const history: any = useOnMountHistory()
    const { pair } = history.location.state
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
    const placeholderAccountName = `Account ${accountNumber}`
    const [creatingAccount, setCreatingAccount] = useState(false)

    const onSubmit = handleSubmit(async (data: createAccountFormData) => {
        try {
            setCreatingAccount(true)
            const newAccount = await createAccount(
                data.accountName ? data.accountName : placeholderAccountName
            )
            history.push({
                pathname: "/privacy/withdraw/block/accounts/step/confirm",
                state: { address: newAccount.address, pair },
            })
        } catch {
            setError("accountName", {
                message: "Error creating account.",
                shouldFocus: true,
            })
        }
    })

    return (
        <form className="w-full h-full" onSubmit={onSubmit}>
            <PopupLayout
                header={<PopupHeader title="Withdraw From Privacy Pool" />}
                footer={
                    <PopupFooter>
                        <LinkButton
                            location="/privacy/withdraw/block/accounts"
                            state={{ pair }}
                            text="Back"
                            lite
                        />
                        <button
                            type="submit"
                            className={classnames(
                                Classes.button,
                                "w-1/2 font-bold border-2 border-primary-300",
                                creatingAccount &&
                                    "opacity-50 pointer-events-none"
                            )}
                        >
                            {!creatingAccount ? "Create" : <Spinner />}
                        </button>
                    </PopupFooter>
                }
            >
                <div className="flex flex-col p-6 space-y-1">
                    <TextInput
                        appearance="outline"
                        label="Account Name"
                        placeholder={placeholderAccountName}
                        name="accountName"
                        register={register}
                        error={errors.accountName?.message}
                    />
                </div>
            </PopupLayout>
        </form>
    )
}

export default WithdrawBlankCreateAccount
