import { createContext, useReducer } from "react";
import { useState } from "react";

const INITIAL_STATE = {
    bookedSlots: [],
    loading: false,
    error: null,
};
const SLOT_NO_LIST = [
    11, 12, 13, 14, 15,21, 22, 23, 24, 25,31, 32, 33, 34, 35,41, 42, 43, 44,45
]
export const SlotStatusContext = createContext(INITIAL_STATE);

const SlotStatusReducer = (state, action) => {
    switch (action.type) {
        case "GET_STATUS_START":
            return {
                bookedSlots: [],
                loading: true,
                error: null,
            };
            break;
        case "GET_STATUS_SUCCESS":
            return {
                bookedSlots: action.payload,
                loading: false,
                error: null,
            };
            break;
        case "GET_STATUS_FAILURE":
            return {
                bookedSlots: [],
                loading: false,
                error: action.payload,
            };
            break;
        default:
            return state;
    }
};

export const SlotStatusContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(SlotStatusReducer, INITIAL_STATE);
    const [activeIds, setActiveIds] = useState([])
    const [disableSlots, setDisableSlots] = useState([])
    const [timingNo,setTimingNo] = useState(0)
    const [dateString, setDateString] = useState(
        //     ()=>{
        //     let yourDate = new Date()
        //     const offset = yourDate.getTimezoneOffset()
        //     yourDate = new Date(yourDate.getTime() - (offset * 60 * 1000))
        //     const stringDate = yourDate.toISOString().split('T')[0]
        //     return stringDate
        // }
        null
    )
    const handleSlotActive = (slotIds) => {
        setActiveIds(slotIds)
        //disable others except the given slotIds
        disableOthers(slotIds)
    }
    const disableOthers = (slotIds) => {
        //disable others except the slotId given in arguments
        const list = SLOT_NO_LIST.filter((slotNo) => {
            return !slotIds.includes(slotNo)
        })
        setDisableSlots(list)
    }
    const unCheckSlotActive = () => {
        setDisableSlots([])
        setActiveIds([])
    }
    return (
        <SlotStatusContext.Provider
            value={{
                bookedSlots: state.bookedSlots,
                loading: state.loading,
                error: state.error,
                dispatch,
                activeIds,
                handleSlotActive,
                disableSlots,
                unCheckSlotActive,
                setDateString,
                dateString,
                timingNo,
                setTimingNo
            }}
        >
            {children}
        </SlotStatusContext.Provider>
    );
};
