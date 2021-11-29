import React, { useState } from "react"
import { InferType } from "yup"
import { ButtonWithLoading } from "../../components/button/ButtonWithLoading"
import PopupHeader from "../../components/popup/PopupHeader"
import PopupLayout from "../../components/popup/PopupLayout"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "react-hook-form"
import { useBlankState } from "../../context/background/backgroundHooks"
import { useOnMountHistory } from "../../context/hooks/useOnMount"
import { useSelectedAccount } from "../../context/hooks/useSelectedAccount"
import TextInput from "../../components/input/TextInput"
import PopupFooter from "../../components/popup/PopupFooter"
import { renameAccount } from "../../context/commActions"

// Schema
const editAccountSchema = yup.object().shape({
    accountName: yup
        .string()
        .required("Please enter an account name")
        .max(40, "Account name is too long"),
})
type editAccountFormData = InferType<typeof editAccountSchema>
const EditAccountPage = () => {
    const { accounts } = useBlankState()!
    const account = useSelectedAccount()
    const history = useOnMountHistory()
    const [isSaving, setIsSaving] = useState(false)

    const {
        register,
        handleSubmit,
        errors,
        setError,
    } = useForm<editAccountFormData>({
        resolver: yupResolver(editAccountSchema),
    })

    const accountNameExists = (name: string) => {
        return Object.values(accounts).some(
            (a) => a.name === name && a.address !== account.address
        )
    }

    const onSubmit = handleSubmit(async (data: editAccountFormData) => {
        try {
            if (accountNameExists(data.accountName || "")) {
                setError("accountName", {
                    message:
                        "Account name is already in use, please use a different one.",
                    shouldFocus: true,
                })
                return false
            }

            setIsSaving(true)

            await renameAccount(account.address, data.accountName)

            setIsSaving(false)

            history.push("/accounts/menu")
        } catch {
            setError("accountName", {
                message: "Error creating the account",
                shouldFocus: true,
            })
        }
    })
    return (
        <PopupLayout
            header={<PopupHeader title="Edit Account" close="/accounts/menu" />}
            footer={
                <PopupFooter>
                    <ButtonWithLoading
                        type="button"
                        isLoading={isSaving}
                        label={"Save"}
                        onClick={onSubmit}
                    />
                </PopupFooter>
            }
        >
            <div className="flex flex-col justify-between flex-1 h-full">
                <div className="flex flex-col flex-1 p-6 space-y-1">
                    <TextInput
                        appearance="outline"
                        label="Account Name"
                        name="accountName"
                        register={register}
                        placeholder={account.name}
                        error={errors.accountName?.message}
                        autoFocus={true}
                        maxLength={40}
                        defaultValue={account.name}
                    />
                </div>
            </div>
        </PopupLayout>
    )
}

export default EditAccountPage
