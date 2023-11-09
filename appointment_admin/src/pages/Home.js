import Navbar from '../components/Navbar';
import DatesPicker from '../components/Date';
import Slot from '../components/Slot';
import styled from 'styled-components';
import Sidebar from '../components/Sidebar';
import { useEffect, useState } from 'react';
import { slotStatuses } from '../context/apiCalls';
import { useContext } from 'react';
import { SlotStatusContext } from '../context/SlotStatusContext';
import { Button, Modal } from 'antd';

const ParentContainer = styled.div`
    display: flex;
`
const OuterContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    /* background: -webkit-radial-gradient(circle, hsla(355, 77%, 52%, 1) 0%, hsla(210, 100%,13%,1) 85%);
    background: hsla(355, 77%, 52%, 1);
    background: radial-gradient(circle, hsla(355, 77%, 52%, 1) 0%, #002142 85%);
    background: -webkit-radial-gradient(circle, hsla(355, 77%,52%,1)0%); */
    background-color: #f1f1f1;
`
const Container = styled.div`
    display: flex;
    justify-content: space-around;
`
const Card = styled.div`
    display: flex;
    margin-top: auto;
    margin-bottom: auto;
    background-color: #f1f1f1;
    padding: 10px;
    border-radius: 10px;
    align-items: center;
    box-shadow: 0px 1px 9px -1px rgba(179,173,179,1);
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
    background-color: ${props => props.type == "completed" ? "#5af542" : (props.type == 'defaulted' ? "#fa4b4b" : (props.type == 'noAction' ? "#6C757D" : (props.type == 'notBooked' ? '#DEE2E6' : null)))};
`
const Home = () => {
    const { dispatch } = useContext(SlotStatusContext)
    const [datePickerOpen, setDatePickerOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(true);
    
    const handleCancelModal = () => {
        setDatePickerOpen(true)
        setIsModalOpen(false);
    };
    useEffect(() => {
            let yourDate = new Date()
            const offset = yourDate.getTimezoneOffset()
            yourDate = new Date(yourDate.getTime() - (offset * 60 * 1000))
            const stringDate = yourDate.toISOString().split('T')[0]
        slotStatuses(dispatch, stringDate)
    }, [dispatch])


    return (
        <ParentContainer>
            <Sidebar />
            <OuterContainer>
                <Navbar />
                <Container>
                    <DatesPicker datePickerOpen={datePickerOpen} />
                    <Card>
                        <Colors>
                            <Color ><ColorIndicator type='completed' />Completed</Color>
                            <Color ><ColorIndicator type='defaulted' />Defaulted</Color>
                            <Color ><ColorIndicator type='noAction' />No Action yet</Color>
                            <Color ><ColorIndicator type='notBooked' />Not booked</Color>
                        </Colors>
                    </Card>
                    <Slot setDatePickerOpen={setDatePickerOpen} />
                </Container>
            </OuterContainer>
            <Modal open={isModalOpen} onCancel={handleCancelModal} centered width={360} footer={[ <Button key="back" onClick={handleCancelModal} type='primary'>Ok</Button>]}>
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
        </ParentContainer>
    )
}
export default Home