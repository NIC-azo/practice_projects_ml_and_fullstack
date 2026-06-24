import { useState, type Dispatch, type SetStateAction } from "react";
import type { FormType } from "@/types/typos.bd";

function DinamycForm(
    {formType, handleForm, activated, setActivated}:
    {
        formType: FormType;
        handleForm: (e: SubmitEvent) => void;
        activated: boolean;
        setActivated: Dispatch<SetStateAction<boolean>>;
    }
) {
    let 
}

export default DinamycForm;