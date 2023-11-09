import { useState } from 'react'
import styled from 'styled-components'
import { useContext } from 'react'
import { SlotStatusContext } from '../context/SlotStatusContext'
import { Tooltip } from 'antd'
import { useEffect } from 'react'
import { CgUnavailable } from 'react-icons/cg'
const BoxContainer = styled.div`
    max-width: 110px;
    height: 75px;
    margin: 10px;
    padding: 10px;
    display:flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color:  ${props => props.unavailable ? "#DEE2E6" : (props.booked ? (props.completed ===true?'#5af542': (props.defaulted ===true?'#fa4b4b': "#6C757D")) : (props.active ? "#2f8ed6" : (props.bulkActive ? "#d38200" : "#DEE2E6")))};
    margin: 8px;
    border-radius: 8px;
    border-style: solid;
    border-color: #DEE2E6;
    border-width: 1px;
    cursor: ${props => props.booked || props.disable || props.unavailable ? "not-allowed" : "pointer"};
    transition: ease background-color 250ms;
    &:hover {
    transform: ${props => props.unavailable == true ? "scale(1)" : "scale(0.98)"}
  } 
`
const Text = styled.p`
    margin: 0;
    font-size: 13px;
    white-space: nowrap; 
    overflow: hidden;
  text-overflow: ellipsis; 
  max-width: 80px;
`

const Hr = styled.hr`

`

const Box = ({ slot, studioUnavailable }) => {
    const [active, setActive] = useState(false)
    const { bookedSlots, activeId, handleSlotActive, disableSlots, unCheckSlotActive, dateString, loading, bulkIdsActive, bulkOn,bookedSlotsData } = useContext(SlotStatusContext)
    const handleClick = (slotId) => {

        if (!bookedSlots.includes(slot.id) && !disableSlots.includes(slotId) && !bulkOn) {
            if (activeId === slotId) {
                setActive(prev => !prev)
                unCheckSlotActive()
            } else if (!bulkOn) {
                setActive(prev => !prev)
                handleSlotActive(slotId)
            }
        }
    }
    useEffect(() => {
        setActive(false)
    }, [dateString, loading])
    useEffect(() => {
        if (bulkOn == true) {
            setActive(false)
        }
    }, [bulkOn])
    // // console.log(unavailableStudios)
    // const [unavailable, setUnavailable] = useState(undefined)
    // console.log(unavailableStudios)
    // useEffect(() => {
    //     setUnavailable(unavailableStudios?.filter(item => {
    //         if (item?._id == Math.floor(slot.id / 10))
    //             return item
    //     })[0]?.activeStatus)
    // }, [])
    // console.log(unavailable)
    // console.log(bookedSlotsData)
    const filteredBookingForBox = bookedSlotsData?.filter(item=>item.slotNo==slot.id)
    let name=''
    if(filteredBookingForBox?.length>0){
        name = filteredBookingForBox[0]?.user_doc[0]
        console.log(filteredBookingForBox)
    }
    return (
        <Tooltip title={bookedSlots.includes(slot.id) ? ((filteredBookingForBox?.length>0 && filteredBookingForBox[0]?.slotBookingsData?.completed === true)? `${filteredBookingForBox[0]?.slotBookingsData?.reasonForCompleted}`: (filteredBookingForBox?.length>0 && filteredBookingForBox[0]?.slotBookingsData?.defaulted===true? `${filteredBookingForBox[0]?.slotBookingsData?.reasonForDefault}`: "no action taken")) : (disableSlots.includes(slot.id) ? "unselect previous" : null)} color={bookedSlots.includes(slot.id) ? ((filteredBookingForBox?.length>0 && filteredBookingForBox[0]?.slotBookingsData?.completed === true)? "#5af542": (filteredBookingForBox?.length>0 && filteredBookingForBox[0]?.slotBookingsData?.defaulted===true?"#fa4b4b": "grey")) : (disableSlots.includes(slot.id) ? "red" : null)}>
            <BoxContainer active={active} onClick={() => handleClick(slot.id)} booked={bookedSlots.includes(slot.id)} disable={disableSlots.includes(slot.id)} bulkActive={bulkIdsActive.includes(slot.id)} unavailable={studioUnavailable} completed={filteredBookingForBox?.length>0?filteredBookingForBox[0].slotBookingsData.completed:false} defaulted={filteredBookingForBox?.length>0?filteredBookingForBox[0].slotBookingsData.defaulted:false}>
                {studioUnavailable === true ? <CgUnavailable size={50} color='#aaaaaa' /> : <Text>{slot.time}</Text>}
                {bookedSlots.includes(slot.id) === true? <Tooltip title={`${name?.name} ${name?.lastname}`} id={slot.id} color='grey' placement='left'><Text>{`${name?.name} ${name?.lastname   }`}</Text></Tooltip>:''}
            </BoxContainer>
        </Tooltip>
    )
}

export default Box