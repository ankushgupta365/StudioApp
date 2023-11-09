export function getTimingStringFromTimingNoOfSlot(timingNo){
    let time = ""
    switch (timingNo) {
      case 1:
        time = "10:00-10:45"
        break;
      case 2:
        time = "11:00-11:45"
        break;
      case 3:
        time = "12:00-12:45"
        break;
      case 4:
        time = "02:00-02:45"
        break;
      case 5:
        time = "03:00-3:45"
        break;
      default:
        return ""
    }
    return time
  }

  export const getCurrentDateString = ()=>{
    let yourDate = new Date()
        const offset = yourDate.getTimezoneOffset()
        yourDate = new Date(yourDate.getTime() - (offset * 60 * 1000))
        const stringDate = yourDate.toISOString().split('T')[0]
        return stringDate
  }
  const getStartTimeFromTimingNo = (timingNo) => {
    let startTime = ''
    switch (timingNo) {
      case 1:
        startTime = '10:00:00'
        break;
      case 2:
        startTime = "11:00:00"
        break;
      case 3:
        startTime = "12:00:00"
        break;
      case 4:
        startTime = "14:00:00"
        break;
      case 5:
        startTime = "15:00:00"
        break;
      default:
        break;
    }
    return startTime
  }

  export function getStartTimeFromTimingNoForDisabling(timingNo,dateString) {
    // Get the current date
    const currentDate = new Date(dateString);
  
    // Parse the start time for the slots (assuming the format "HH:mm:ss")
    const startTime = getStartTimeFromTimingNo(timingNo); // Replace with your desired start time
    const [hours, minutes, seconds] = startTime.split(":").map(Number);
  
    // Set the time for the current date based on the slot number
    currentDate.setHours(hours); 
    // Set minutes and seconds to 0 (optional)
    currentDate.setMinutes(0);
    currentDate.setSeconds(0);
  
    // Get the datetime in milliseconds
    const datetimeInMilliseconds = currentDate.getTime();
  
    return datetimeInMilliseconds;
  }