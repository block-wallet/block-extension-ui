import React, { useState } from "react"

import PopupHeader from "../../components/popup/PopupHeader"
import PopupLayout from "../../components/popup/PopupLayout"
import HorizontalSelect from "../../components/input/HorizontalSelect"
import Divider from "../../components/Divider"
import PopupFooter from "../../components/popup/PopupFooter"
import TextInput from "../../components/input/TextInput"
import SelectInput from "../../components/input/SelectInput"

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

// Schema
const createAccountSchema = yup.object().shape({
    accountName: yup.string().max(40, "Account name is too long"),
})
type createAccountFormData = InferType<typeof createAccountSchema>

const importAccountSchema = yup.object().shape({
    privateKey: yup
        .string()
        .required("Please enter a private key")
        .min(64, "Please enter a valid private key")
        .max(66, "Please enter a valid private key"),
    importType: yup.string().required("Please select a type of import"),
    accountName: yup.string().max(40, "Account name is too long"),
})
type importAccountFormData = InferType<typeof importAccountSchema>

// Subcomponents
const CreateAccountForm = (props: any) => {
    const { setIsCreating } = props
    const state = useBlankState()!
    const history = useOnMountHistory()
    const [creatingAccount, setCreatingAccount] = useState(false)
    const {
        register,
        handleSubmit,
        errors,
        setError,
    } = useForm<createAccountFormData>({
        resolver: yupResolver(createAccountSchema),
    })
    const [placeholderAccountName] = useState(
        `Account ${Object.keys(state.accounts).length + 1}`
    )
    const accountNameExists = (name: string) => {
        return Object.values(state.accounts).some((a) => a.name === name)
    }
    const onSubmit = handleSubmit(async (data: createAccountFormData) => {
        if (!data.accountName || !data.accountName.trim()) {
            data.accountName = placeholderAccountName
        }

        data.accountName = data.accountName.trim()

        try {
            if (accountNameExists(data.accountName || ""))
                throw new Error(
                    "Account name is already in use, please use a different one."
                )

            setCreatingAccount(true)
            setIsCreating(true)

            const newAccount = await createAccountAction(data.accountName)
            await selectAccount(newAccount.address)

            setCreatingAccount(false)

            history.push("/")
        } catch {
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
                    placeholder={placeholderAccountName}
                    error={errors.accountName?.message}
                    autoFocus={true}
                    maxLength={40}
                />
            </div>
            <hr className="border-0.5 border-gray-200 w-full" />
            <PopupFooter>
                <ButtonWithLoading
                    type="submit"
                    isLoading={creatingAccount}
                    label={"Create"}
                ></ButtonWithLoading>
            </PopupFooter>
        </form>
    )
}

const ImportAccountForm = (props: any) => {
    const { setIsCreating } = props

    const state = useBlankState()!
    const history = useOnMountHistory()
    const [importingAccount, setImportingAccount] = useState(false)
    const {
        register,
        handleSubmit,
        errors,
        setError,
    } = useForm<importAccountFormData>({
        resolver: yupResolver(importAccountSchema),
    })
    const placeholderAccountName = `Account ${
        Object.keys(state.accounts).length + 1
    }`
    const accountNameExists = (name: string) => {
        return Object.values(state.accounts).some((a) => a.name === name)
    }
    const onSubmit = handleSubmit(async (data: importAccountFormData) => {
        if (!data.accountName || !data.accountName.trim()) {
            data.accountName = placeholderAccountName
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

            setImportingAccount(true)
            setIsCreating(true)

            const newAccount = await importAccountPrivateKey(
                { privateKey: data.privateKey },
                data.accountName
            )
            await selectAccount(newAccount.address)

            setImportingAccount(false)
            setIsCreating(false)

            history.push("/")
        } catch (e: any) {
            if (
                e.message ===
                "The account you're are trying to import is a duplicate"
            ) {
                setError("privateKey", {
                    message: "Account already exists",
                    shouldFocus: true,
                })
            } else {
                setError("privateKey", {
                    message: "Error importing the account",
                    shouldFocus: true,
                })
            }

            setImportingAccount(false)
            setIsCreating(false)
        }
    })

    return (
        <form
            className="flex flex-col justify-between flex-1 h-full"
            onSubmit={onSubmit}
        >
            <div className="flex flex-col flex-1 p-6 space-y-3">
                <div className="flex flex-col space-y-1">
                    <TextInput
                        appearance="outline"
                        label="Account Name"
                        name="accountName"
                        register={register}
                        placeholder={placeholderAccountName}
                        error={errors.accountName?.message}
                        autoFocus={true}
                        maxLength={40}
                    />
                </div>
                <div className="flex flex-col space-y-1 mb-5">
                    <SelectInput
                        label="Select Type"
                        name="importType"
                        register={register}
                        error={errors.type?.message}
                    >
                        <option value="Private Key" selected>
                            Private Key
                        </option>
                    </SelectInput>
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
            </div>
            <hr className="border-0.5 border-gray-200 w-full" />
            <PopupFooter>
                <ButtonWithLoading
                    type="submit"
                    isLoading={importingAccount}
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

    const [isCreating, setIsCreating] = useState(false)
    return (
        <PopupLayout
            header={
                <PopupHeader title="Create Account" disabled={isCreating} />
            }
        >
            <HorizontalSelect
                options={tabs}
                value={selectedTab}
                onChange={setSelectedTab}
            />
            <Divider />
            <div className="flex flex-col flex-1 w-full">
                {selectedTab === "Create" ? (
                    <CreateAccountForm setIsCreating={setIsCreating} />
                ) : (
                    <ImportAccountForm setIsCreating={setIsCreating} />
                )}
            </div>
        </PopupLayout>
    )
}

export default CreateAccountPage
