import { useContext } from "react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import styled from "styled-components";
import { AuthContext } from "../context/AuthContext";

const Container = styled.div`
  width: 180px;
  height: 130vh;
  padding: 20px;
  background-color: #ffffffff;
  /* background: radial-gradient(circle, hsla(355, 77%, 52%, 1) 0%, #002142 85%); */
  border-right: 1px solid #333;
  /* border-width: 1px; */
  box-shadow: 0px 1px 9px -1px rgba(179, 173, 179, 1);
`;
const Logo = styled.div`
  cursor: pointer;
`;
const Image = styled.img`
  width: 140px;
  height: 60px;
`;
const Menu = styled.ul`
  list-style: none;
  margin-top: 100px;
  padding: 5px;
`;
const ListItem = styled.li`
  cursor: pointer;
  padding: 5px;
  margin: 8px;
  font-size: 20px;
  font-weight: 600;
  border-bottom: ${(props) =>
    props.selected == true ? "4px solid red" : "none"};
  border-radius: 2px;
  transition: border-bottom 1s ease-in-out;
  color: ${(props) => (props.special === true ? "#d90429" : "inherit")};
`;
const Sidebar = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  console.log(user);
  return (
    <Container>
      <Logo>
        <Link to="/" style={{ textDecoration: "none" }}>
          <Image src="https://www.cuchd.in/about/assets/images/cu-logo.png" />
        </Link>
      </Logo>
      <Menu>
        <ListItem selected={location.pathname == "/"} value="/">
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            Home
          </Link>
        </ListItem>
        {user?.role == "recorder" || user?.role == "manager" || user?.role == "pcs"? null : (
          <ListItem selected={location.pathname == "/users"} value="/users">
            <Link
              to="/users"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              Users
            </Link>
          </ListItem>
        )}
       { user?.role == "pcs"?null:( <ListItem selected={location.pathname == "/requests"} value="/requests">
          <Link
            to="/requests"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            Requests
          </Link>
        </ListItem>)}
        {user?.role == "recorder" || user?.role == "manager" || user?.role == "pcs" ? null : (
          <ListItem
            selected={location.pathname == "/programs"}
            value="/programs"
          >
            <Link
              to="/programs"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              Programs
            </Link>
          </ListItem>
        )}
        {user?.role == "recorder" || user?.role == "manager" || user?.role == "pcs"? null : (
          <ListItem
            selected={location.pathname == "/configure"}
            value="/configure"
          >
            <Link
              to="/configure"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              Configure
            </Link>
          </ListItem>
        )}

       { user?.role == "pcs"? null: (<ListItem
          selected={location.pathname == "/manage"}
          value="/configure"
          special={true}
        >
          <Link
            to="/manage"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            Manage
          </Link>
        </ListItem>)}

        {user?.role == "recorder" || user?.role == "manager" || user?.role == "pcs"? null : (
          <ListItem
            selected={location.pathname == "/cancelled"}
            value="/cancelled"
          >
            <Link
              to="/cancelled"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              Cancelled
            </Link>
          </ListItem>
        )}
         {user?.role == "recorder" || user?.role == "manager" || user?.role == "pcs"? null : (
          <ListItem
            selected={location.pathname == "/waiting"}
            value="/waiting"
          >
            <Link
              to="/waiting"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              Waiting
            </Link>
          </ListItem>
        )}
      </Menu>
    </Container>
  );
};

export default Sidebar;
