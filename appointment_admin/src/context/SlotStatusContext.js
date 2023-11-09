import { createContext, useEffect, useReducer } from "react";
import { useState } from "react";
import { data } from "../data";
import { userRequest } from "../requestMethods";

const INITIAL_STATE = {
    bookedSlots: [],
    loading: false,
    error: null,
    bookedSlotsData: []
};
const SLOT_NO_LIST = [
    11, 12, 13, 14, 15, 21, 22, 23, 24, 25, 31, 32, 33, 34, 35, 41, 42, 43, 44, 45
]
export const SlotStatusContext = createContext(INITIAL_STATE);

const SlotStatusReducer = (state, action) => {
    switch (action.type) {
        case "GET_STATUS_START":
            return {
                bookedSlots: [],
                loading: true,
                error: null,
                bookedSlotsData: []
            };
        case "GET_STATUS_SUCCESS":
            return {
                bookedSlots: action.payload.slotNos,
                loading: false,
                error: null,
                bookedSlotsData: action.payload.slotData
            };
        case "GET_STATUS_FAILURE":
            return {
                bookedSlots: [],
                loading: false,
                error: action.payload,
                bookedSlotsData:[]
            };
        default:
            return state;
    }
};

export const SlotStatusContextProvider = ({ children }) => {
    const [state, dispatch] = useReducer(SlotStatusReducer, INITIAL_STATE);
    const [activeId, setActiveId] = useState(null)
    const [disableSlots, setDisableSlots] = useState([])
    const [dateString, setDateString] = useState(() => {
        let yourDate = new Date()
        const offset = yourDate.getTimezoneOffset()
        yourDate = new Date(yourDate.getTime() - (offset * 60 * 1000))
        const stringDate = yourDate.toISOString().split('T')[0]
        return stringDate
    })
    const [bulkOn, setBulkOn] = useState(false)
    const [bulkIdsActive, setBulkIdsActive] = useState([])
    

    const handleSlotActive = (slotId) => {
        setActiveId(slotId)
        //disable others except the given slotId
        disableOthers(slotId)
    }
    const disableOthers = (slotId) => {
        //disable others except the slotId given in arguments
        const list = SLOT_NO_LIST.filter((slotNo) => {
            return slotNo !== slotId
        })
        setDisableSlots(list)
    }
    const unCheckSlotActive = () => {
        setDisableSlots([])
        setActiveId(null)
    }
    const handleBulkOnActive = (studioNos) => {
        unCheckSlotActive();
        const newArr = data.flatMap((item, index) => {
            if (studioNos.includes(item.idx + 1)) {
                return item.ids
            } else {
                return []
            }
        })
        setBulkIdsActive(newArr)
    }
    useEffect(() => {
        if (bulkOn === true) {
            console.log("this ranee")
            setDisableSlots([])
            setActiveId(null)
        }
    }, [bulkOn])

   
    return (
        <SlotStatusContext.Provider
            value={{
                bookedSlots: state.bookedSlots,
                bookedSlotsData: state.bookedSlotsData,
                loading: state.loading,
                error: state.error,
                dispatch,
                activeId,
                handleSlotActive,
                disableSlots,
                unCheckSlotActive,
                setDateString,
                dateString,
                bulkOn,
                setBulkOn,
                handleBulkOnActive,
                bulkIdsActive
            }}
        >
            {children}
        </SlotStatusContext.Provider>
    );
};
