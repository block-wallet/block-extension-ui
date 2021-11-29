import React from "react"

import PopupHeader from "../../components/popup/PopupHeader"
import PopupLayout from "../../components/popup/PopupLayout"
import Divider from "../../components/Divider"
import PopupFooter from "../../components/popup/PopupFooter"
import TextInput from "../../components/input/TextInput"

import * as yup from "yup"
import { InferType } from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { useForm } from "react-hook-form"
import { useOnMountHistory } from "../../context/hooks/useOnMount"
import {
    useAddressBook,
    useAddressBookRecentAddresses,
} from "../../context/hooks/useAddressBook"
import { utils } from "ethers"
import { addressBookSet } from "../../context/commActions"
import { ButtonWithLoading } from "../../components/button/ButtonWithLoading"

// new contact schema
const contactSchema = yup.object().shape({
    contactName: yup
        .string()
        .test("is-empty", "Contact name is empty.", (s) => {
            return !!s && s.trim().length > 0
        })
        .max(40, "Contact name is too long"),
    contactAddress: yup
        .string()
        .required("No address provided.")
        .test("is-correct", "Address is incorrect.", (address) => {
            return utils.isAddress(address || "")
        }),
})
type contactFormData = InferType<typeof contactSchema>

const AddContactPage = (props: any) => {
    const history = useOnMountHistory()
    const addressBook = useAddressBook()
    const recentAddresses = useAddressBookRecentAddresses()
    const {
        register,
        handleSubmit,
        errors,
        setError,
    } = useForm<contactFormData>({
        resolver: yupResolver(contactSchema),
    })

    const { editMode, contact } = history.location.state
    const pageTitle = editMode ? "Edit Contact" : "New Contact"
    const buttonTitle = editMode ? "Update" : "Add"

    const placeholderСontactName = `Contact ${
        Object.keys(addressBook).length + 1
    }`

    const contactNameExists = (name: string) => {
        return (
            Object.values(addressBook).some((a) => a.name === name) ||
            Object.values(recentAddresses).some((a) => a.name === name)
        )
    }
    const onSubmit = handleSubmit(async (data: contactFormData) => {
        try {
            if (contactNameExists(data.contactName || "")) {
                throw new Error(
                    "Сontact name is already in use, please use a different one."
                )
            }

            await addressBookSet(
                data.contactAddress,
                data.contactName ? data.contactName : placeholderСontactName,
                ""
            )
            history.push("/settings/addressBook")
        } catch {
            setError("contactName", {
                message: "Error saving the new contact.",
                shouldFocus: true,
            })
        }
    })

    return (
        <PopupLayout
            header={<PopupHeader title={pageTitle} close="/" />}
            footer={
                <PopupFooter>
                    <ButtonWithLoading
                        label={buttonTitle}
                        type="submit"
                        onClick={onSubmit}
                    />
                </PopupFooter>
            }
        >
            <Divider />
            <div className="flex flex-col w-full justify-between flex-1 h-full">
                <div className="flex flex-col flex-1 p-6 space-y-3">
                    <div className="flex flex-col space-y-1">
                        <TextInput
                            appearance="outline"
                            label="Contact Name"
                            name="contactName"
                            register={register}
                            placeholder={placeholderСontactName}
                            error={errors.contactName?.message}
                            autoFocus={true}
                            maxLength={40}
                            defaultValue={contact?.name}
                        />
                    </div>
                    <div className="flex flex-col space-y-1">
                        <TextInput
                            appearance="outline"
                            label="Contact Address"
                            name="contactAddress"
                            register={register}
                            placeholder="Address"
                            error={errors.contactAddress?.message}
                            autoFocus={false}
                            defaultValue={contact?.address}
                        />
                    </div>
                </div>
                <hr className="border-0.5 border-gray-200 w-full" />
            </div>
        </PopupLayout>
    )
}

export default AddContactPage
