export const ACTION_TYPE = {
    BOOKING_START: "BOOKING_START",
    BOOKING_SUCCESS: "BOOKING_SUCCESS",
    BOOKING_FAIL: "BOOKING_FAILURE"
}
export const INITIAL_STATE_SLOT_REDUCER = {
    posting: false,
    success: false,
    error: false
}

export const bookingReducer = (state,action)=>{
    switch (action.type){
        case ACTION_TYPE.BOOKING_START: return {
            ...state,
            posting: true,
        };
        case ACTION_TYPE.BOOKING_SUCCESS: return {
            ...state,
            posting: false,
            success: true,
        };
        case ACTION_TYPE.BOOKING_FAIL: return {
            ...state,
            error: true
        };
        default: return state;
    }
}