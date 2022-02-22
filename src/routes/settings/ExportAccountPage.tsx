import React, { useState } from "react"

import PopupHeader from "../../components/popup/PopupHeader"
import PopupLayout from "../../components/popup/PopupLayout"
import PasswordInput from "../../components/input/PasswordInput"

import PopupFooter from "../../components/popup/PopupFooter"
import WarningTip from "../../components/label/WarningTip"
import * as yup from "yup"
import { InferType } from "yup"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import { useBlankState } from "../../context/background/backgroundHooks"
import {
    verifyPassword,
    exportAccountPrivateKey,
    exportAccountJson,
    requestSeedPhrase,
} from "../../context/commActions"
import { useOnMountHistory } from "../../context/hooks/useOnMount"
import { ButtonWithLoading } from "../../components/button/ButtonWithLoading"
import Dropdown from "../../components/input/Dropdown"

const schema = yup.object({
    password: yup.string().required("No password provided."),
    exportType: yup
        .string()
        .default("key")
        .required("Please select an export format"),
    encryptingPassword: yup
        .string()
        .nullable()
        .notRequired()
        .when("exportType", {
            is: (value: any) => value === "json",
            then: (rule) =>
                rule.required("Please enter an encrypting password"),
        }),
    encryptingPasswordConfirmation: yup
        .string()
        .nullable()
        .notRequired()
        .when("encryptingPassword", {
            is: (value: any) => !!value,
            then: (rule) =>
                rule
                    .required("Required")
                    .oneOf(
                        [yup.ref("encryptingPassword"), null],
                        "Encrypting passwords must match."
                    ),
        }),
})

type ExportAccountFormData = InferType<typeof schema>

const ExportAccountPage = () => {
    const history = useOnMountHistory()
    const blankState = useBlankState()!
    const [
        isVerificationInProgress,
        setIsVerificationInProgress,
    ] = useState<boolean>(false)
    const {
        register,
        handleSubmit,
        setError,
        errors,
        watch,
        setValue,
    } = useForm<ExportAccountFormData>({
        defaultValues: {
            exportType: "key",
        },
        resolver: yupResolver(schema),
        shouldUnregister: false,
    })

    const exportType = watch("exportType")
    const onSubmit = handleSubmit(async (data: ExportAccountFormData) => {
        setIsVerificationInProgress(true)
        try {
            const isValidPassword = await verifyPassword(data.password)
            if (!isValidPassword) {
                throw new Error("Incorrect password")
            }

            let exportData = ""

            switch (data.exportType) {
                case "key":
                    exportData = await exportAccountPrivateKey(
                        blankState.selectedAddress,
                        data.password
                    )
                    break
                case "json":
                    exportData = await exportAccountJson(
                        blankState.selectedAddress,
                        data.password,
                        data.encryptingPassword!
                    )
                    break
                case "seedphrase":
                    exportData = await requestSeedPhrase(data.password)
                    break
            }

            setIsVerificationInProgress(false)
            history.push({
                pathname: "/accounts/menu/export/done",
                state: { exportData, exportType: data.exportType },
            })
        } catch (e) {
            setError("password", {
                message: e.message,
                shouldFocus: true,
            })
        }
        setIsVerificationInProgress(false)
    })

    return (
        <div className="flex flex-col w-full h-full" id="export-key-form">
            <PopupLayout
                header={<PopupHeader title="Export Account Data" />}
                footer={
                    <PopupFooter>
                        <ButtonWithLoading
                            label="Export"
                            type="submit"
                            isLoading={isVerificationInProgress}
                            onClick={onSubmit}
                        />
                    </PopupFooter>
                }
            >
                <div className="flex flex-col p-6 space-y-4">
                    <div className="flex flex-col space-y-1">
                        <PasswordInput
                            label="Your Password"
                            placeholder="Your Password"
                            register={register}
                            error={errors.password?.message}
                            autoFocus={true}
                        />
                    </div>
                    <div className="flex flex-col space-y-1 mb-5">
                        <Dropdown
                            onChange={(value) => {
                                setValue("exportType", value)
                            }}
                            currentValue={exportType}
                            label="Format"
                            id="exportType"
                            error={errors.exportType?.message}
                        >
                            <Dropdown.DropdownItem value="key">
                                Private Key
                            </Dropdown.DropdownItem>
                            <Dropdown.DropdownItem value="json">
                                JSON Data
                            </Dropdown.DropdownItem>
                            <Dropdown.DropdownItem value="seedphrase">
                                Seed Phrase
                            </Dropdown.DropdownItem>
                        </Dropdown>
                    </div>
                    <div className="flex flex-col space-y-1">
                        {exportType === "json" && (
                            <>
                                <div className="mb-5">
                                    <PasswordInput
                                        label="Encrypting Password"
                                        placeholder="Encrypting Password"
                                        register={register}
                                        error={
                                            errors.encryptingPassword?.message
                                        }
                                        autoFocus={false}
                                        name="encryptingPassword"
                                    />
                                </div>
                                <PasswordInput
                                    label="Confirm Encrypting Password"
                                    placeholder="Confirm Encrypting Password"
                                    register={register}
                                    error={
                                        errors.encryptingPasswordConfirmation
                                            ?.message
                                    }
                                    autoFocus={false}
                                    name="encryptingPasswordConfirmation"
                                />
                            </>
                        )}
                    </div>
                    {exportType === "json" && (
                        <WarningTip
                            text={
                                "Encrypting password is optional but strongly recommended"
                            }
                            fontSize="text-xs"
                            justify="justify-start"
                        />
                    )}
                    {/** UNCOMMENT THIS TO ENABLE PHISHING PROTECTION FEATURE */}
                    {/*  {blankState.settings.useAntiPhishingProtection && (
                        <AntiPhishing image={blankState.antiPhishingImage} />
                    )} */}
                </div>
            </PopupLayout>
        </div>
    )
}

export default ExportAccountPage
