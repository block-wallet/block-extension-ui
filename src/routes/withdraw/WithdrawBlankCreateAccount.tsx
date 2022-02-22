import React, { useState } from "react"

import PopupHeader from "../../components/popup/PopupHeader"
import PopupLayout from "../../components/popup/PopupLayout"
import PopupFooter from "../../components/popup/PopupFooter"
import TextInput from "../../components/input/TextInput"

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
                header={
                    <PopupHeader
                        title="Withdraw From Privacy Pool"
                        onBack={() => {
                            history.push({
                                pathname: "/privacy/withdraw/block/accounts",
                                state: { pair },
                            })
                        }}
                    />
                }
                footer={
                    <PopupFooter>
                        <ButtonWithLoading
                            type="submit"
                            label="Create"
                            isLoading={creatingAccount}
                        />
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
