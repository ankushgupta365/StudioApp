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
    margin-top: 0;
    padding: 20px;
    padding-top: 0;
    /* box-shadow: 0px 1px 9px -1px rgba(179,173,179,1); */
`
const DatesPicker = ({ datePickerOpen, holidays }) => {
  const { dispatch, setDateString } = useContext(SlotStatusContext)
  const onChange = (date, dateString) => {
    setDateString(dateString)
    // slotStatuses(dispatch, dateString)
  };
  const customDatesToDisable = [
    '2023-11-10',
    '2023-11-11',
    '2023-11-12',
    '2023-11-13',
    '2023-11-14',
  ];
  const disabledDate = (current) => {
    // Check if the date is after tomorrow and before 90 days from now.
    if (current < dayjs().add(1, 'day') || current > dayjs().add(90, 'day')) {
      return true;
    }

    // if (current > dayjs().add(90, 'day')) {
    //   return true;
    // }

    // Check if the date is a Sunday.
    const day = current.weekday();
    if (day === 0) {
      return true;
    }

  // Check if the date is in the customDatesToDisable array.
  const formattedCurrentDate = current.format('YYYY-MM-DD');
  if (holidays.includes(formattedCurrentDate)) {
    return true;
  }

    // The date is not disabled.
    return false;
  }
  return (
    <Container>
      <DatePicker onChange={onChange} open={datePickerOpen} style={{ width: "288px", fontSize: "28px", boxShadow: '0px 1px 9px -1px rgba(179,173,179,1)' }} size="large" disabledDate={disabledDate} />
    </Container>
  )
}

export default DatesPicker