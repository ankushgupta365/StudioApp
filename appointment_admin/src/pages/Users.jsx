import React, { useEffect, useState } from 'react'
import Sidebar from '../components/Sidebar'
import styled from 'styled-components'
import { Result, Space, Spin, Table, Tag, message, Button, Modal } from 'antd';
import Navbar from '../components/Navbar';
import axios from 'axios';
import { getUsers } from '../context/apiCalls';
import { userRequest } from '../requestMethods';
import { DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined, UserSwitchOutlined } from '@ant-design/icons';
import ResponsivePagination from 'react-responsive-pagination';
import 'react-responsive-pagination/themes/classic.css';


const Container = styled.div`
  display: flex;
`
const User = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`
const ButtonLocal = styled.button`
  border: none;
  margin-left: 5px;
  margin-right: 5px;
  padding: 2px;
`
const Pagination = styled.div`
  margin-top: 20px;
`
const OuterDiv = styled.div`
  
`
const Users = () => {

  const [users, setUsers] = useState([])
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true)

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1)

  const handlePageChange = (page) => {
    setCurrentPage(page)
    async function getUsers() {
      setUsers([])
      setLoading(true)
      const res = await userRequest.get(`/user?page=${page}&limit=10`)
      setLoading(false)
      return res
    }
    getUsers().then((res) => {
      setUsers(res.data.users)
      // setTotalPages(res.data.count)
    })
  }

  useEffect(() => {
    async function getUsers() {
      setLoading(true)
      setUsers([])
      const res = await userRequest.get("/user?page=1&limit=10")
      setLoading(false)
      return res
    }
    getUsers().then((res) => {
      setUsers(res.data.users)
      setTotalPages(res.data.count)
    })
  }, [])

  const handleDelete = async (userId) => {
    try {
      await userRequest.delete(`/user/${userId}`)
    } catch (error) {

    }
    async function getUsers() {
      setUsers([])
      setLoading(true)
      const res = await userRequest.get(`/user?page=${currentPage}&limit=10`)
      setLoading(false)
      return res
    }
    getUsers().then((res) => setUsers(res.data.users))
    success()
  }

  const handleStatus = async (userId, status) => {
    let newStatus = ''
    if (status == 'approved') {
      newStatus = 'pending'
    } else if (status == 'pending') {
      newStatus = 'approved'
    }
    try {
      await userRequest.post(`/user/${userId}`, {
        status: newStatus
      })
    } catch (error) {
      console.log(error)
    }
    async function getUsers() {
      setUsers([])
      setLoading(true)
      const res = await userRequest.get(`/user?page=${currentPage}&limit=10`)
      setLoading(false)
      return res
    }
    getUsers().then((res) => setUsers(res.data.users))
    success()
  }

  const [loadingModal, setLoadingModal] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null)
  const [newSelectedRole, setNewSelectedRole] = useState(null)
  const showModal = (user) => {
    setOpen(true);
    setSelectedUser(user)
  };
  const handleOk = async () => {
    setLoadingModal(true);
    if (newSelectedRole) {
      await userRequest.post(`user/role/${selectedUser._id}`, {
        role: newSelectedRole
      })
      setLoadingModal(false)
      async function getUsers() {
        setUsers([])
        setLoading(true)
        const res = await userRequest.get(`/user?page=${currentPage}&limit=10`)
        setLoading(false)
        return res
      }
      getUsers().then((res) => setUsers(res.data.users))
      success()
    }
    setOpen(false)

  };
  const handleCancel = () => {
    setOpen(false);
  };

  const handleChangeSelect = (e) => {
    setNewSelectedRole(e.target.value)
  }
  const warning = () => {
    messageApi.open({
      type: 'warning',
      content: 'Please do approprite action',
      style: {
        marginTop: "5vh",
        padding: "2px 10px"
      }
    });
  };

  const success = () => {
    messageApi.open({
      type: 'success',
      content: 'Action done successfully',
      style: {
        marginTop: "5vh",
        padding: "2px 10px"
      }
    });
  };

  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 110,
        alignSelf: 'center',
        marginTop: '160px'
      }}
      spin
    />
  );

  return (
    <Container>
      {contextHolder}
      <Sidebar />
      <User>
        <Navbar />
        <Spin indicator={antIcon} spinning={loading} size='large'>
          {users.length > 0 ? <><div style={{maxHeight: '65vh'}} className='table-responsive d-flex w-75 m-auto mt-4'><table className='table text-center table-striped table-hover table-bordered'>
            <tbody>
              <tr className='table-dark'>
                <td>S.No</td>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
              {
                users?.map((user,index) => {
                  return (
                    <tr key={user._id}>
                      <td>{index+1 + (10 * (currentPage-1))}</td>
                      <td>{user?.name}</td>
                      <td>{user?.lastname}</td>
                      <td>{user?.email}</td>
                      <td>{user?.role}</td>
                      <td>{user?.status}</td>
                      <td>
                        {user?.role == "admin" ? null : <ButtonLocal onClick={() => handleDelete(user._id)}><DeleteOutlined style={{ color: "red", fontSize: "18px", margin: "2px" }} /></ButtonLocal>}
                        {user?.role == "admin" ? null : <ButtonLocal onClick={() => handleStatus(user._id, user.status)}>{user.status == "approved" ? <CloseCircleOutlined style={{ color: "red", fontSize: "18px" }} /> : <CheckCircleOutlined style={{ color: "green", fontSize: "18px" }} />}</ButtonLocal>}
                        {<ButtonLocal onClick={() => showModal(user)}>{<UserSwitchOutlined style={{ fontSize: '18px', margin: '2px' }} />}</ButtonLocal>}
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
          </div>
            <Pagination>
              <ResponsivePagination
                current={currentPage}
                total={totalPages}
                onPageChange={page => handlePageChange(page)}
              />
            </Pagination></> : !loading &&
          <Result
            status="404"
            title="There are no users registered"
            subTitle="It's is sad to know that, know one is using this app"
            style={{ margin: '60px' }}
          />
          }
          <Modal
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            footer={[
              <Button key="back" onClick={handleCancel}>
                Return
              </Button>,
              <Button key="submit" type="primary" loading={loadingModal} onClick={handleOk} danger>
                Confirm
              </Button>
            ]}
          >
            <OuterDiv>
              <h3>Change User Role</h3>
              <div>
                <div>
                  <p>First Name: {selectedUser?.name}</p>
                  <p>Last Name: {selectedUser?.lastname}</p>
                </div>
                <div>
                  <span>Present Role:</span><span>{selectedUser?.role}</span>
                </div>
                <br />
                <div>
                  <span>Change to:</span>
                  <select onChange={(e) => handleChangeSelect(e)}>
                    <option hidden selected='true' disabled='disabled'>select</option>
                    <option value='admin'>admin</option>
                    <option value='teacher'>teacher</option>
                    <option value='manager'>manager</option>
                    <option value='recorder'>recorder</option>
                    <option value='pcs'>pcs & vcs</option>
                  </select>
                  { }
                </div>
              </div>
            </OuterDiv>
          </Modal>
        </Spin>
      </User>
    </Container>
  )
}

export default Users