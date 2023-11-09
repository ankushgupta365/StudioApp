import React, { useContext, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import { userRequest } from "../requestMethods";
import { DeleteOutlined, LoadingOutlined } from "@ant-design/icons";
import { message, Result, Spin, Tooltip } from "antd";
import ResponsivePagination from "react-responsive-pagination";
import "react-responsive-pagination/themes/classic.css";
import {
  getTimingStringFromTimingNoOfSlot,
  todayDateStringToSendToBackend,
} from "../utils/dateUtil";
import { AuthContext } from "../context/AuthContext";

const Container = styled.div`
  display: flex;
`;
const Request = styled.div`
  width: 100%;
`;
const Button = styled.button`
  border: none;
  margin-left: 5px;
  margin-right: 5px;
  padding: 2px;
`;
const MainContent = styled.div`
  display: flex;
  flex-direction: column;
`;
const Pagination = styled.div`
  margin-top: 20px;
`;

const Requests = () => {
  const [bookings, setBookings] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const {user}  = useContext(AuthContext)
  const handlePageChange = (page) => {
    console.log(page);
    setCurrentPage(page);

    async function getBookings() {
      setLoading(true);
      setBookings([]);
      const res = await userRequest.post(
        `/booking/find?page=${page}&limit=10`,
        {
          dateString: todayDateStringToSendToBackend(),
        }
      );
      setLoading(false);
      return res;
    }

    getBookings().then((res) => {
      setBookings(res.data.bookings);
      setTotalPages(res.data.totalPages);
    });
  };

  useEffect(() => {
    async function getBookings() {
      setLoading(true);
      const res = await userRequest.post("/booking/find", {
        dateString: todayDateStringToSendToBackend(),
      });
      setLoading(false);
      return res;
    }
    getBookings().then((res) => {
      setBookings(res.data.bookings);
      setTotalPages(res.data.totalPages);
    });
  }, []);
  console.log(bookings);
  const handleDelete = async (booking) => {
    const { studioNo, timingNo, slotNo } = booking;
    const date = booking.slotBookingsData.date;
    try {
      await userRequest.post("/booking/delete", {
        studioNo,
        timingNo,
        date,
        slotNo
      });
    } catch (error) {
      return console.log(error);
    }
    let yourDate = new Date();
    const offset = yourDate.getTimezoneOffset();
    yourDate = new Date(yourDate.getTime() - offset * 60 * 1000);
    const stringDate = yourDate.toISOString().split("T")[0];

    async function getBookings() {
      setBookings([]);
      setLoading(true);
      const res = await userRequest.post(`/booking/find?page=${1}`, {
        dateString: stringDate,
      });
      setLoading(false);
      setCurrentPage(1);
      return res;
    }
    getBookings().then((res) => {
      setBookings(res.data.bookings);
      setTotalPages(res.data.totalPages);
    });

    success();
  };

  const warning = () => {
    messageApi.open({
      type: "warning",
      content: "Please do approprite action",
      style: {
        marginTop: "5vh",
        padding: "2px 10px",
      },
    });
  };

  const success = () => {
    messageApi.open({
      type: "success",
      content: "Action done successfully",
      style: {
        marginTop: "5vh",
        padding: "2px 10px",
      },
    });
  };

  const antIcon = (
    <LoadingOutlined
      style={{
        fontSize: 110,
        alignSelf: "center",
        marginTop: "160px",
      }}
      spin
    />
  );
  function localDateStringToDDMMYYYY(localDateString) {
    // Convert the local date string to a Date object.
    const localDate = new Date(localDateString);

    // Get the day, month, and year from the Date object.
    let day = localDate.getDate();
    let month = localDate.getMonth() + 1;
    let year = localDate.getFullYear();

    // Add leading zeros to the day and month digits if they are less than 10.
    if (day < 10) {
      day = "0" + day;
    }
    if (month < 10) {
      month = "0" + month;
    }

    // Return the date in DD/MM/YYYY format.
    return day + "/" + month + "/" + year;
  }
  return (
    <Container>
      {contextHolder}
      <Sidebar />
      <Request>
        <Navbar />
        <Spin indicator={antIcon} spinning={loading} size="large">
          {bookings && bookings.length > 0 ? (
            <MainContent>
              <div style={{ maxHeightheight: "65vh"}} className="table-responsive d-flex m-auto mt-4">
                  <table className="table text-center table-striped table-hover table-bordered">
                    <tbody>
                      <tr className="table-dark">
                        <th>S.No</th>
                        <th>Timing</th>
                        <th>Studio No</th>
                        <th>Slot No</th>
                        <th>Date</th>
                        <th>Course</th>
                        <th>Program</th>
                        <th>Sem</th>
                        <th>Full Name</th>
                        <th>Role</th>
                        <th>Email</th>
                        <th>Actions</th>
                      </tr>
                      {bookings &&
                        bookings?.map((booking, index) => {
                          return (
                            <tr key={booking.slotBookingsData._id}>
                              <td>{index + 1 + 10 * (currentPage - 1)}</td>
                              <td>
                                {getTimingStringFromTimingNoOfSlot(
                                  booking?.timingNo
                                )}
                              </td>
                              <td>{booking.studioNo}</td>
                              <td>{Math.trunc(booking.slotNo % 10)}</td>
                              <td>
                                {localDateStringToDDMMYYYY(
                                  booking.slotBookingsData.date
                                )}
                              </td>
                              <Tooltip
                                title={booking.slotBookingsData.program}
                                color="grey"
                                key={booking.slotBookingsData._id}
                                placement="left"
                              >
                                <td>
                                  <span
                                    className="d-inline-block text-truncate"
                                    style={{ width: "200px" }}
                                  >
                                    {booking.slotBookingsData.program}
                                  </span>
                                </td>
                              </Tooltip>
                              <td>{booking?.slotBookingsData?.degree}</td>
                              <td>{booking?.slotBookingsData?.semester}</td>
                              <td>{`${booking.user_doc.name} ${booking.user_doc.lastname}`}</td>
                              <td>{booking.user_doc.role}</td>
                              <td>{booking.user_doc.email}</td>
                              <td>
                                {
                                  !(user?.role == "recorder" || user?.role == "manager") && <Button onClick={() => handleDelete(booking)}>
                                    <DeleteOutlined
                                      style={{
                                        color: "red",
                                        fontSize: "18px",
                                        margin: "2px",
                                      }}
                                    />
                                  </Button>
                                }
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
              </div>
              <Pagination>
                <ResponsivePagination
                  current={currentPage}
                  total={totalPages}
                  onPageChange={(page) => handlePageChange(page)}
                />
              </Pagination>
            </MainContent>
          ) : (
            !loading && (
              <Result
                status="404"
                title="There are no bookings created by teachers for future"
                subTitle="You are free today, feel free to read some News"
                style={{ margin: "60px" }}
              />
            )
          )}
        </Spin>
      </Request>
    </Container>
  );
};

export default Requests;
