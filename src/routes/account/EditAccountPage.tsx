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
import SuccessDialog from "../../components/dialog/SuccessDialog"

// Schema
const editAccountSchema = yup.object().shape({
    accountName: yup
        .string()
        .trim()
        .required("Please enter an account name")
        .max(40, "Account name is too long"),
})
type editAccountFormData = InferType<typeof editAccountSchema>
const EditAccountPage = () => {
    const { accounts } = useBlankState()!
    const account = useSelectedAccount()
    const history = useOnMountHistory()
    const [isSaving, setIsSaving] = useState(false)
    const [saved, setSaved] = useState(false)

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
            setSaved(true)
        } catch {
            setError("accountName", {
                message: "Error creating the account",
                shouldFocus: true,
            })

            setIsSaving(false)
        }
    })
    return (
        <PopupLayout
            header={<PopupHeader title="Edit Account" disabled={isSaving} />}
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
            <SuccessDialog
                open={saved}
                title="Congratulations"
                timeout={1400}
                message="Your changes have been succesfully saved!"
                onDone={() =>
                    history.push({
                        pathname: "/accounts/menu",
                        state: { fromAction: true },
                    })
                }
            />
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
