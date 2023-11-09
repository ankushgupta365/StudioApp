import { userRequest } from "../requestMethods"
import { getCurrentDateString } from "./dateUtils"

const getBookings = async (url, payload) => {
    const res = await userRequest.post(url, {
        ...payload
    })
    return res
}


export const getCountWaiting = async(user)=>{
    try {
        let url = "/booking/reserve/history"
        let payload = {
            userEmail: user.email,
            dateString:  getCurrentDateString(),
            bookingsType: 'waiting'
        }
        const countWaiting = getBookings(url, payload).then((res) => {
           return  res.data.bookings.length
        })
        return countWaiting
    } catch (error) {
        console.log(error)
    }
}
export const getCountToday = async(user)=>{
    try {
        let url = "/booking/history"
        let payload = {
            userEmail: user.email,
            dateString: getCurrentDateString(),
            bookingsType: 'today'
        }

        const countToday = getBookings(url, payload).then((res) => {
                return res.data.bookings.length
        })
        return countToday
    } catch (error) {
        console.log(error)
    }
}
export const getCountUpcoming = async(user)=>{
    try {
        let url = "/booking/history"
        let payload = {
            userEmail: user.email,
            dateString: getCurrentDateString(),
            bookingsType: 'upcoming'
        }

        const countUpcoming = getBookings(url, payload).then((res) => {
           return res.data.bookings.length
        })
        return countUpcoming 
    } catch (error) {
        console.log(error)
    }
}
export const getCountPast = async(user)=>{
    try {
        let url = "/booking/history"
        let payload = {
            userEmail: user.email,
            dateString: getCurrentDateString(),
            bookingsType: 'past'
        }

        const countPast = getBookings(url, payload).then((res) => {
            return res.data.bookings.length
        })
        return countPast
    } catch (error) {
        console.log(error)
    }
}
export const getCountCancelled = async(user)=>{
    try {
        let url = "/booking/cancelled/history"
        let payload = {
            userEmail: user.email,
            dateString: getCurrentDateString(),
            bookingsType: 'cancelled'
        }

       const countCancelled =  getBookings(url, payload).then((res) => {
           return  res.data.bookings.length
        })
        return countCancelled
    } catch (error) {
        console.log(error)
    }
}
