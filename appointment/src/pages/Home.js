import Navbar from '../components/Navbar';
import DatesPicker from '../components/Date';
import Slot from '../components/Slot';
import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { slotStatuses, slotStatusesWithType } from '../context/apiCalls';
import { useContext } from 'react';
import { SlotStatusContext } from '../context/SlotStatusContext';
import { Radio, Space, Modal,Button } from 'antd';
import TypeWriter from 'typewriter-effect'
import CuBackgroud from '../assets/cubackground.jpg'
import { getCountCancelled, getCountPast, getCountToday, getCountUpcoming, getCountWaiting } from '../utils/statsUtils';
import { AuthContext } from '../context/AuthContext';
import { publicRequest } from '../requestMethods';

const OuterContainer = styled.div`
    height: 110vh;
     /* background: hsla(355, 77%, 52%, 1); */
     /* background: rgb(238,105,105); */
/* background: radial-gradient(circle, rgba(238,105,105,1) 23%, rgba(255,255,255,1) 96%); */
    background: linear-gradient(rgba(115,115,115,0.89), rgba(115,115,115,0.89)), url("https://images.news18.com/ibnlive/uploads/2022/01/untitled-design-1-1-164371082616x9.jpg") center;
`
const SmallContainer = styled.div`
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px 0;
    color: #000;
    font-size: 25px;
    font-weight: 600;
    letter-spacing: 1.2px;
`
const Container = styled.div`
    display: flex;
    justify-content: space-evenly;
`
const RadioContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`
const Card = styled.div`
    display: flex;
    margin-top: 40px;
    background-color: #f1f1f1;
    padding: 10px;
    border-radius: 10px;
    align-items: center;
    box-shadow: 0px 1px 9px -1px rgba(179,173,179,1);
`
const StatCard = styled.div`
    margin-top: 40px;
    padding: 18px;
    border-radius: 10px;
    background-color: #f1f1f1;
    box-shadow: 0px 1px 9px -1px rgba(179,173,179,1);
    width: 450px;
`
const Colors = styled.ul`
    list-style: none;
    margin: 8px;
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
`
const Color = styled.li`
    display: flex;
    align-items: center;
    font-size: 14px;
`
const ColorIndicator = styled.div`
    height: 18px;
    width: 18px;
    border-radius: 50%;
    margin-right:10px;
    background-color: ${props => props.type == "available" ? "#DEE2E6" : (props.type == 'selected' ? "#ef233c" : (props.type == 'booked' ? "#6C757D" : (props.type == 'selectedBooked' ? '#A020F0' : null)))};
`
const Type = styled.ul`
    list-style: none;
`
const Des = styled.li`
`
const Home = () => {
    const { dispatch } = useContext(SlotStatusContext)
    const [datePickerOpen, setDatePickerOpen] = useState(false)
    const [slotType, setSlotType] = useState("");
    const [loadingStats,setLoadingStats] = useState(false)
    const { user } = useContext(AuthContext)
    const [cancelledCount, setCancelledCount] = useState(0)
    const [waitingCount,setWaitingCount] = useState(0)
    const [pastCount,setPastCount] = useState(0)
    const [upcomingCount,setUpcomingCount]=useState(0)
    const [todayCount,setTodayCount] = useState(0)
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [holidays,setHolidays] = useState([])

    const getHolidays = async()=>{
        const res = await publicRequest.get("/holidays")
        setHolidays(res.data.dateArray)
    }
    
    const handleCancelModal = () => {
        setDatePickerOpen(true)
        setIsModalOpen(false);
    };

    useEffect(()=>{
        
        const getDifferenData = ()=>{
    setLoadingStats(true)
         getCountCancelled(user).then(res=>setCancelledCount(res))
         getCountPast(user).then(res=>setPastCount(res))
         getCountUpcoming(user).then(res=>setUpcomingCount(res))
         getCountToday(user).then(res=>setTodayCount(res))
         getCountWaiting(user).then(res=>setWaitingCount(res))
         setLoadingStats(false)
        }
         getDifferenData()
         getHolidays()
    },[])

    const onChange = (e) => {
        setSlotType(e.target.value);
    };

    // useEffect(() => {
    //     // let yourDate = new Date()
    //     // const offset = yourDate.getTimezoneOffset()
    //     // yourDate = new Date(yourDate.getTime() - (offset * 60 * 1000))
    //     // const stringDate = yourDate.toISOString().split('T')[0]
    //     // // slotStatuses(dispatch, stringDate)
    //     // slotStatusesWithType(dispatch,stringDate,slotType)
    // }, [slotType,stringDate])
    return (
        <OuterContainer>
            <Navbar />
            <SmallContainer>
                <TypeWriter
                    options={{
                        strings: ['Welcome To IDOL Department Studio Reservation System'],
                        autoStart: true,
                        loop: true,
                    }}
                />
            </SmallContainer>
            <Container>
                <DatesPicker datePickerOpen={datePickerOpen} holidays={holidays} />
                <RadioContainer>
                    <Radio.Group onChange={onChange} value={slotType} size='large' style={{ backgroundColor: "#f1f1f1", padding: '10px', borderRadius: '10px', boxShadow: '0px 1px 9px -1px rgba(179,173,179,1)' }}>
                        <Space direction='vertical' style={{ margin: '8px', padding: '8px' }}>
                            <Radio value='theory'>Theory</Radio>
                            <Radio value='numerical'>Numerical</Radio>
                        </Space>
                    </Radio.Group>
                    <Card>
                        <Colors>
                            <Color ><ColorIndicator type='available' />Available</Color>
                            <Color ><ColorIndicator type='booked' />Booked</Color>
                            <Color ><ColorIndicator type='selectedBooked' />In Queue</Color>
                        </Colors>
                    </Card>
                    <StatCard>
                        {loadingStats === true?'loading':
                            <div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}>
                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                                <p style={{margin: '0'}}>Today</p>
                                <p style={{fontSize: '35px', fontWeight: 'bold', color: 'rgb(160, 32, 240)',margin: '0' }}>{todayCount}</p>
                            </div>
                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                                <p style={{margin: '0'}}>Past</p>
                                <p style={{fontSize: '35px', fontWeight: 'bold', color: 'rgb(160, 32, 240)',margin: '0' }}>{pastCount}</p>
                            </div>
                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                                <p style={{margin: '0'}}>Upcoming</p>
                                <p style={{fontSize: '35px', fontWeight: 'bold', color: 'rgb(160, 32, 240)', margin: '0'}}>{upcomingCount}</p>
                            </div>
                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                                <p style={{margin: '0'}}>Queue</p>
                                <p style={{fontSize: '35px', fontWeight: 'bold', color: 'rgb(160, 32, 240)',margin: '0' }}>{waitingCount}</p>
                            </div>
                            <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                                <p style={{margin: '0'}}>Cancelled</p>
                                <p style={{fontSize: '35px', fontWeight: 'bold', color: 'rgb(160, 32, 240)',margin: '0' }}>{cancelledCount}</p>
                            </div>
                        </div>}
                    </StatCard>
                </RadioContainer>
                <Slot setDatePickerOpen={setDatePickerOpen} slotType={slotType} setSlotType={setSlotType} />
            </Container>
            <Modal open={isModalOpen} centered width={360} footer={[ <Button key="back" onClick={handleCancelModal} type='primary'>Ok</Button>]} onCancel={handleCancelModal}>
                <div>
                    <div className='mb-2 mt-1'>
                        <p className='h4 m-0 py-1'><strong>Do's</strong></p>
                        <p className='m-0 p-1'>For Best experience only use in desktop/laptop</p>
                        <p className='m-0 p-1'>Do familiarize yourself</p>
                        <p className='m-0 p-1'>Do update availability</p>
                        <p className='m-0 p-1'>Do plan ahead</p>
                        <p className='m-0 p-1'>Do provide details</p>
                        <p className='m-0 p-1'>Do communicate changes</p>
                        <p className='m-0 p-1'>Do respect others booking</p>
                        <p className='m-0 p-1'>Do collaborate</p>
                        <p className='m-0 p-1'>Do provide feedback</p>
                    </div>
                    <div>
                        <p className='h4 m-0 py-1'><strong>Dont's</strong></p>
                        <p className='m-0 p-1'>Don't Overbook</p>
                        <p className='m-0 p-1'>Don't forget to cancel</p>
                        <p className='m-0 p-1'>Don't assume availability</p>
                        <p className='m-0 p-1'>Don't hog the space</p>
                        <p className='m-0 p-1'>Don't ignore notifications</p>
                        <p className='m-0 p-1'>Don't neglect communications</p>
                        <p className='m-0 p-1'>Don't delay updates</p>
                    </div>
                </div>
            </Modal>
        </OuterContainer>

    )
}

export default Home