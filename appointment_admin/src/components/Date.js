import React from 'react'
import { DatePicker } from 'antd'
import styled from 'styled-components'
import { useContext } from 'react'
import { SlotStatusContext } from '../context/SlotStatusContext'
import { slotStatuses } from '../context/apiCalls'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
const Container = styled.div`
    margin: 20px;
    padding: 20px;
    margin-top: 15vh;
`
const DatesPicker = ({ datePickerOpen }) => {
  const { dispatch, setDateString} = useContext(SlotStatusContext)
  const onChange = (date, dateString) => {
    setDateString(dateString)
    slotStatuses(dispatch, dateString)
  };
  const disabledDate = (current)=>{
   // Check if the date is a Sunday.
   const day = current.weekday();
   if (day === 0) {
     return true;
   }

   // The date is not disabled.
   return false;
  }
  return (
    <Container>
      <DatePicker onChange={onChange} open={datePickerOpen} style={{ width: "288px", fontSize: "28px" }} size="large"/>
    </Container>
  )
}

export default DatesPicker