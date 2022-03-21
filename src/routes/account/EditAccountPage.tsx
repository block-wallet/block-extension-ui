import React from "react"
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
import WaitingDialog, {
    useWaitingDialog,
} from "../../components/dialog/WaitingDialog"

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

    const fromAccountList = history.location.state?.fromAccountList

    const { status, isOpen, dispatch } = useWaitingDialog()

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

            dispatch({
                type: "open",
                payload: { status: "loading" },
            })

            await renameAccount(account.address, data.accountName)

            dispatch({ type: "setStatus", payload: { status: "success" } })
        } catch {
            setError("accountName", {
                message: "Error renaming the account",
                shouldFocus: true,
            })

            dispatch({ type: "setStatus", payload: { status: "error" } })
        }
    })
    return (
        <PopupLayout
            header={
                <PopupHeader
                    title="Edit Account"
                    disabled={isOpen}
                    onBack={() =>
                        history.push({
                            pathname: "/accounts/menu",
                            state: {
                                fromAccountList,
                            },
                        })
                    }
                />
            }
            footer={
                <PopupFooter>
                    <ButtonWithLoading
                        type="button"
                        isLoading={isOpen && status === "loading"}
                        label={"Save"}
                        onClick={onSubmit}
                    />
                </PopupFooter>
            }
        >
            <WaitingDialog
                status={status}
                open={isOpen}
                titles={{
                    loading: "Renaming...",
                    success: "Congratulations",
                    error: "Error",
                }}
                timeout={1400}
                texts={{
                    loading: "Account is being renamed...",
                    success: "Your changes have been succesfully saved!",
                    error: errors.accountName?.message ?? "",
                }}
                onDone={() => {
                    if (status === "error") {
                        dispatch({ type: "close" })
                        return
                    }

                    history.push({
                        pathname: "/accounts/menu",
                        state: { fromAccountList },
                    })
                }}
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
