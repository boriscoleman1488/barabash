import "./widgetSm.css";
import { Visibility } from "@material-ui/icons";
import { useEffect } from "react";
import { useState } from "react";
import axios from "axios";

export default function WidgetSm() {
  const [newUsers, setNewUsers] = useState([]);

  useEffect(() => {
    const getNewUsers = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/users?new=true",
          {
            headers: {
              token:
                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NDE0MWVmMzFkYzc1MWNjMjg3MTYxMyIsImlzQWRtaW4iOnRydWUsImlhdCI6MTY4MjI3MDk4NCwiZXhwIjoxNjg0ODYyOTg0fQ.9wzZviFlh1MKgH9GBAh8Pc-aMcnR-dYYBqpFXDwi3tI  ",
            },
          }
        );
        setNewUsers(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    getNewUsers();
  }, []);

  return (
    <div className="widgetSm">
      <span className="widgetSmTitle">New Join Members</span>
      <ul className="widgetSmList">
        {newUsers.map((user, id) => (
          <li key={user._id} className="widgetSmListItem">
            <img
              src={
                user.profilePic ||
                "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              }
              alt=""
              className="widgetSmImg"
            />
            <div className="widgetSmUser">
              <span className="widgetSmUsername">{user.username}</span>
            </div>
            <button className="widgetSmButton">
              <Visibility className="widgetSmIcon" />
              Display
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
