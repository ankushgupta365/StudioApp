import { useState } from 'react'
import styled from 'styled-components'
import { useContext } from 'react'
import { SlotStatusContext } from '../context/SlotStatusContext'
import { Tooltip } from 'antd'
import { useEffect } from 'react'
import { CgUnavailable } from 'react-icons/cg'
const BoxContainer = styled.div`
    width: 85%;
    margin: 10px;
    padding: 15px 0;
    display:flex;
    align-items: center;
    justify-content: center;
    /* background-color:  ${props => props.booked ? "#6C757D" : (props.active ? "#ef233c" : (props.reserveActive ? "#A020F0" : "#DEE2E6"))}; */
    background-color:  ${props => props.unavailable ? "#DEE2E6" : (props.reserveActive ? "#A020F0" : (props.active ? "#ef233c" : (props.booked ? "#6C757D" : "#DEE2E6")))};
    margin: 8px;
    border-radius: 8px;
    border-style: solid;
    border-color: #DEE2E6;
    border-width: 1px;
    /* cursor: ${props => props.booked || props.disable ? "not-allowed" : "pointer"}; */   // previous
    cursor: ${props => props.disable || props.unavailable ? "not-allowed" : "pointer"};     //new 
    transition: ease background-color 250ms;
    &:hover {
        transform: ${props => props.unavailable == true ? "scale(1)" : "scale(0.98)"}
  } 
`
const Text = styled.p`
    color: ${props => props.active === true ? "#fff" : "#333"};
    margin-bottom: 0;
`
const Box = ({ slot, studioUnavailable,slotType }) => {
    const [active, setActive] = useState(false)
    const [reserveActive, setReserveActive] = useState(false)
    const { bookedSlots, activeIds, handleSlotActive, disableSlots, unCheckSlotActive, dateString, loading, setTimingNo } = useContext(SlotStatusContext)
    console.log("reserveActive ", reserveActive)
    console.log("active ", active)

    const handleClick = (slotIds) => {
        if(studioUnavailable == true){
            return;
        }
       else if (!slot.ids.every(ae => bookedSlots.includes(ae)) && !slot.ids.every(ae => disableSlots.includes(ae))) {
            if (slot.ids.every(ae => activeIds.includes(ae))) {
                setActive(prev => !prev)
                unCheckSlotActive()
            } else {
                setActive(prev => !prev)
                handleSlotActive(slotIds)
                setTimingNo(slot.timingNo)
            }
        } else if (slot.ids.every(ae => bookedSlots.includes(ae)) && !slot.ids.every(ae => disableSlots.includes(ae))) {
            if (slot.ids.every(ae => activeIds.includes(ae))) {
                setReserveActive(prev => !prev)
                unCheckSlotActive()
            } else {
                setReserveActive(true)
                setTimingNo(slot.timingNo)
                handleSlotActive(slotIds)
            }
        }
    }

    useEffect(() => {
        setActive(false)
        setReserveActive(false)
        unCheckSlotActive()
    }, [dateString, loading,slotType])
    return (
        //arr1.some( ai => arr2.includes(ai) );  arr2 include atleast one element of arr1
        //arr1.every( ai => arr2.includes(ai) ); arr2 include every element of arr1
        <Tooltip title={slot.ids.every(ae => bookedSlots.includes(ae)) ? "booked" : (slot.ids.every(ae => disableSlots.includes(ae)) ? "unselect previous" : null)} color={slot.ids.every(ae => bookedSlots.includes(ae)) ? "cyan" : "red"}>
            <BoxContainer active={active} reserveActive={reserveActive} onClick={() => handleClick(slot.ids)} booked={slot.ids.every(ae => bookedSlots.includes(ae))} disable={slot.ids.every(ae => disableSlots.includes(ae))} unavailable={studioUnavailable}>
                {studioUnavailable === true ? <CgUnavailable size={20} color='#aaaaaa' /> : <Text>{slot.time}</Text>}
            </BoxContainer>
        </Tooltip>
    )
}

export default Box