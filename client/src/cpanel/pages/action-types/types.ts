import { EDIT_ACTION_TYPE_MODEL } from "../../../types";
import React from "react";
import { _axios } from "../../../config/request";

export type EDIT_ACTION_TYPE_PROPS = { state: EDIT_ACTION_TYPE_MODEL, setState: React.Dispatch<React.SetStateAction<EDIT_ACTION_TYPE_MODEL>>, refresh: () => void, onClose: () => void }
