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
import SelectInput from "../../components/input/SelectInput"
import { ButtonWithLoading } from "../../components/button/ButtonWithLoading"

const schema = yup.object().shape({
    password: yup.string().required("No password provided."),
    exportType: yup.string().required("Please select an export format"),
    encryptingPassword: yup
        .string()
        .nullable()
        .notRequired()
        .when("exportType", {
            is: (value: any) => value === "json",
            then: (rule) =>
                rule.required("Please enter an encrypting password"),
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

    const [exportType, setExportType] = useState<string>("key")

    const {
        register,
        handleSubmit,
        setError,
        errors,
    } = useForm<ExportAccountFormData>({
        resolver: yupResolver(schema),
    })

    const onSubmit = handleSubmit(async (data: ExportAccountFormData) => {
        setIsVerificationInProgress(true)
        try {
            await verifyPassword(data.password)

            let exportData = ""

            switch (data.exportType) {
                case "Private Key":
                    exportData = await exportAccountPrivateKey(
                        blankState.selectedAddress,
                        data.password
                    )
                    break
                case "JSON Data":
                    exportData = await exportAccountJson(
                        blankState.selectedAddress,
                        data.password,
                        data.encryptingPassword!
                    )
                    break
                case "Seed Phrase":
                    exportData = await requestSeedPhrase(data.password)
                    break
            }

            setIsVerificationInProgress(false)
            history.push({
                pathname: "/accounts/menu/export/done",
                state: { exportData, exportType: data.exportType },
            })
        } catch {
            setError("password", {
                message: "Error exporting account",
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
                        <SelectInput
                            label="Select Format"
                            name="exportType"
                            register={register}
                            error={errors.exportType?.message}
                            onChange={(value) => {
                                setExportType(value)
                            }}
                        >
                            <option value="Private Key">Private Key</option>
                            <option value="JSON Data">JSON Data</option>
                            <option value="Seed Phrase">Seed Phrase</option>
                        </SelectInput>
                    </div>
                    <div className="flex flex-col space-y-1">
                        {exportType === "JSON Data" && (
                            <PasswordInput
                                label="Encrypting Password"
                                placeholder="Encrypting Password"
                                register={register}
                                error={errors.encryptingPassword?.message}
                                autoFocus={false}
                                name="encryptingPassword"
                            />
                        )}
                    </div>
                    {exportType === "JSON Data" && (
                        <WarningTip
                            text={
                                "Encrypting password is optional but strongly recommended"
                            }
                            fontSize="text-xs"
                            justify="justify-start"
                        />
                    )}
                </div>
            </PopupLayout>
        </div>
    )
}

export default ExportAccountPage
