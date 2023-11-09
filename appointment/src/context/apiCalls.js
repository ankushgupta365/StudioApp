import { publicRequest,userRequest } from "../requestMethods";



export const slotStatuses = async (dispatch,dateString,header)=>{
        dispatch({type:"GET_STATUS_START"})
        try {
            const res = await publicRequest.post("/booking/status", {"date": dateString},{headers: header})
            dispatch({type:"GET_STATUS_SUCCESS", payload: res.data})
        } catch (error) {
            dispatch({type:"GET_STATUS_FAILURE"})
        }
}

export const slotStatusesWithType = async (dispatch,dateString,type,header)=>{
    dispatch({type:"GET_STATUS_START"})
    try {
        const res = await publicRequest.post(`/booking/status/${type}`, {"date": dateString},{headers: header})
        dispatch({type:"GET_STATUS_SUCCESS", payload: res.data})
    } catch (error) {
        dispatch({type:"GET_STATUS_FAILURE"})
    }
}

