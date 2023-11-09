import { publicRequest,userRequest } from "../requestMethods";



export const slotStatuses = async (dispatch,dateString)=>{
        dispatch({type:"GET_STATUS_START"})
        try {
            const res = await userRequest.post("/booking/status", {"date": dateString})
            dispatch({type:"GET_STATUS_SUCCESS", payload: res.data})
        } catch (error) {
            dispatch({type:"GET_STATUS_FAILURE"})
        }
}

export const getUsers = async()=>{
    try {
        const res = await userRequest.get("/user")
        const users = await res.data
        return users
    } catch (error) {
        console.log(error)
    }
}
