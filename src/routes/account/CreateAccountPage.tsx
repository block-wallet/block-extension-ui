import React, { useRef, useState } from "react"

import PopupHeader from "../../components/popup/PopupHeader"
import PopupLayout from "../../components/popup/PopupLayout"
import HorizontalSelect from "../../components/input/HorizontalSelect"
import Divider from "../../components/Divider"
import PopupFooter from "../../components/popup/PopupFooter"
import TextInput from "../../components/input/TextInput"
import WaitingDialog, {
    useWaitingDialog,
} from "../../components/dialog/WaitingDialog"
import AntiPhishing from "../../components/phishing/AntiPhishing"
import * as yup from "yup"
import { InferType } from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "react-hook-form"

import {
    createAccount as createAccountAction,
    importAccountPrivateKey,
    selectAccount,
} from "../../context/commActions"
import { useBlankState } from "../../context/background/backgroundHooks"
import { useOnMountHistory } from "../../context/hooks/useOnMount"
import { ButtonWithLoading } from "../../components/button/ButtonWithLoading"
import Dropdown from "../../components/input/Dropdown"

// Schema
const createAccountSchema = yup.object({
    accountName: yup.string().max(40, "Account name is too long"),
})
type createAccountFormData = InferType<typeof createAccountSchema>

const importAccountSchema = yup.object({
    privateKey: yup
        .string()
        .required("Please enter a private key")
        .min(64, "Please enter a valid private key")
        .max(66, "Please enter a valid private key"),
    importType: yup.string().required("Please select a type of import"),
    accountName: yup.string().max(40, "Account name is too long"),
})
type importAccountFormData = InferType<typeof importAccountSchema>

type subProps = {
    onStartCreating: () => void
    onEndCreating: () => void
    onError: (error: string) => void
    isCreating: boolean
}
// Subcomponents
const CreateAccountForm = (props: subProps) => {
    const { onStartCreating, onEndCreating, onError, isCreating } = props
    const state = useBlankState()!

    const {
        register,
        handleSubmit,
        errors,
        setError,
    } = useForm<createAccountFormData>({
        resolver: yupResolver(createAccountSchema),
    })
    const placeholderAccountName = useRef(
        `Account ${Object.keys(state.accounts).length + 1}`
    )
    const accountNameExists = (name: string) => {
        return Object.values(state.accounts).some((a) => a.name === name)
    }
    const onSubmit = handleSubmit(async (data: createAccountFormData) => {
        if (!data.accountName || !data.accountName.trim()) {
            data.accountName = placeholderAccountName.current
        }

        data.accountName = data.accountName.trim()

        try {
            if (accountNameExists(data.accountName || ""))
                throw new Error(
                    "Account name is already in use, please use a different one."
                )

            onStartCreating()

            const newAccount = await createAccountAction(data.accountName)
            await selectAccount(newAccount.address)

            onEndCreating()
        } catch {
            onError("Couldn't create the account")

            setError("accountName", {
                message: "Error creating the account",
                shouldFocus: true,
            })
        }
    })

    return (
        <form
            className="flex flex-col justify-between flex-1 h-full"
            onSubmit={onSubmit}
            id="create-account-form"
            aria-label="Create account"
        >
            <div className="flex flex-col flex-1 p-6 space-y-1">
                <TextInput
                    appearance="outline"
                    label="Account Name"
                    name="accountName"
                    register={register}
                    placeholder={placeholderAccountName.current}
                    error={errors.accountName?.message}
                    autoFocus={true}
                    maxLength={40}
                />
            </div>
            <hr className="border-0.5 border-gray-200 w-full" />
            <PopupFooter>
                <ButtonWithLoading
                    type="submit"
                    isLoading={isCreating}
                    label={"Create"}
                ></ButtonWithLoading>
            </PopupFooter>
        </form>
    )
}

const ImportAccountForm = (props: subProps) => {
    const { isCreating, onStartCreating, onEndCreating, onError } = props

    const state = useBlankState()!

    const {
        register,
        handleSubmit,
        errors,
        setError,
        setValue,
        watch,
    } = useForm<importAccountFormData>({
        defaultValues: {
            importType: "key",
        },
        shouldUnregister: false,
        resolver: yupResolver(importAccountSchema),
    })
    const importType = watch("importType")
    const placeholderAccountName = useRef(
        `Account ${Object.keys(state.accounts).length + 1}`
    )
    const accountNameExists = (name: string) => {
        return Object.values(state.accounts).some((a) => a.name === name)
    }
    const onSubmit = handleSubmit(async (data: importAccountFormData) => {
        if (!data.accountName || !data.accountName.trim()) {
            data.accountName = placeholderAccountName.current
        }

        data.accountName = data.accountName.trim()

        try {
            if (accountNameExists(data.accountName || "")) {
                setError("accountName", {
                    message:
                        "Account name is already in use, please use a different one.",
                    shouldFocus: true,
                })
                return
            }

            onStartCreating()

            const newAccount = await importAccountPrivateKey(
                { privateKey: data.privateKey },
                data.accountName
            )
            await selectAccount(newAccount.address)

            onEndCreating()
        } catch (e: any) {
            if (
                e.message ===
                "The account you're are trying to import is a duplicate"
            ) {
                onError("This account already exists")
                setError("privateKey", {
                    message: "Account already exists",
                    shouldFocus: true,
                })
            } else {
                onError("Couldn't import the account")

                setError("privateKey", {
                    message: "Error importing the account",
                    shouldFocus: true,
                })
            }
        }
    })

    return (
        <form
            className="flex flex-col justify-between flex-1 h-full"
            onSubmit={onSubmit}
        >
            <div className="flex flex-col flex-1 p-6 pb-3 space-y-3">
                <div className="flex flex-col space-y-1">
                    <TextInput
                        appearance="outline"
                        label="Account Name"
                        name="accountName"
                        register={register}
                        placeholder={placeholderAccountName.current}
                        error={errors.accountName?.message}
                        autoFocus={true}
                        maxLength={40}
                    />
                </div>
                <div className="flex flex-col space-y-1 mb-5">
                    <Dropdown
                        onChange={(value) => {
                            setValue("importType", value)
                        }}
                        currentValue={importType}
                        label="Select Type"
                        id="type"
                        error={errors.importType?.message}
                    >
                        <Dropdown.DropdownItem value="key">
                            Private Key
                        </Dropdown.DropdownItem>
                    </Dropdown>
                </div>
                <div className="flex flex-col space-y-1">
                    <TextInput
                        appearance="outline"
                        label="Private Key String"
                        placeholder="Paste your private key string here"
                        name="privateKey"
                        register={register}
                        error={errors.privateKey?.message}
                        maxLength={66}
                    />
                </div>
                {state.settings.useAntiPhishingProtection && (
                    <div className="pt-2">
                        <AntiPhishing image={state.antiPhishingImage} />
                    </div>
                )}
            </div>
            <hr className="border-0.5 border-gray-200 w-full" />
            <PopupFooter>
                <ButtonWithLoading
                    type="submit"
                    isLoading={isCreating}
                    label={"Import"}
                ></ButtonWithLoading>
            </PopupFooter>
        </form>
    )
}

// Component
const CreateAccountPage = () => {
    const tabs = ["Create", "Import"]
    const [selectedTab, setSelectedTab] = useState(tabs[0])
    const history = useOnMountHistory()

    const [actionLabel, setActionLabel] = useState("")
    const [error, setError] = useState("")

    const { isOpen, status, dispatch } = useWaitingDialog()

    const isCreating = status === "loading" && isOpen

    return (
        <PopupLayout
            header={
                <PopupHeader title="Create New Account" disabled={isCreating} />
            }
        >
            <WaitingDialog
                status={status}
                open={isOpen}
                titles={{
                    loading: "Fetching balances...",
                    error: "Error",
                    success: "Success!",
                }}
                texts={{
                    loading: `Please wait while your account is being ${actionLabel}...`,
                    error: error,
                    success: `Congratulations! Your account is ${actionLabel}!`,
                }}
                onDone={() => {
                    if (!!error) {
                        dispatch({ type: "close" })
                        return
                    }

                    history.push("/")
                }}
                timeout={1400}
            />
            <HorizontalSelect
                options={tabs}
                value={selectedTab}
                onChange={setSelectedTab}
            />
            <Divider />
            <div className="flex flex-col flex-1 w-full">
                {selectedTab === "Create" ? (
                    <CreateAccountForm
                        onStartCreating={() => {
                            dispatch({
                                type: "open",
                                payload: { status: "loading" },
                            })
                            setActionLabel("created")
                        }}
                        onError={(e) => {
                            dispatch({
                                type: "setStatus",
                                payload: { status: "error" },
                            })
                            setError(
                                "There was an error while creating the account"
                            )
                        }}
                        onEndCreating={() => {
                            setActionLabel("created")
                            dispatch({
                                type: "setStatus",
                                payload: { status: "success" },
                            })
                        }}
                        isCreating={isCreating}
                    />
                ) : (
                    <ImportAccountForm
                        onStartCreating={() => {
                            dispatch({
                                type: "open",
                                payload: { status: "loading" },
                            })
                            setActionLabel("imported")
                        }}
                        onError={(e) => {
                            dispatch({
                                type: "setStatus",
                                payload: { status: "error" },
                            })
                            setError(
                                "There was an error while importing the account"
                            )
                        }}
                        onEndCreating={() => {
                            setActionLabel("imported")
                            dispatch({
                                type: "setStatus",
                                payload: { status: "success" },
                            })
                        }}
                        isCreating={isCreating}
                    />
                )}
            </div>
        </PopupLayout>
    )
}

export default CreateAccountPage
