import Navbar from "../../components/navbar/Navbar";
import Featured from "../../components/featured/Featured";
import "./Home.scss";
import List from "../../components/list/List";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../authContext/AuthContext";

const Home = ({ type }) => {
  const [lists, setLists] = useState([]);
  const [genre, setGenre] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const getRandomLists = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/lists${type ? `?type=${type}` : ""}${
            genre ? `&genre=${genre}` : ""
          }`,
          {
            headers: {
              token: "Bearer " + user?.accessToken,
            },
          }
        );

        console.log("Lists response:", res);
        setLists(res.data);
      } catch (error) {
        console.log("Error fetching lists:", error);
      }
    };
    
    if (user?.accessToken) {
      getRandomLists();
    }
  }, [type, genre, user]);

  // Показуємо інформацію про користувача та токен
  return (
    <div className="home">
      <Navbar />
      
      {/* Інформаційна панель користувача */}
      <div className="user-info">
        <div className="user-details">
          <h2>Вітаємо, {user?.username || user?.firstName}!</h2>
          <div className="user-data">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>ID:</strong> {user?._id}</p>
            <p><strong>Email підтверджено:</strong> {user?.isEmailVerified ? "Так" : "Ні"}</p>
            <p><strong>Адміністратор:</strong> {user?.isAdmin ? "Так" : "Ні"}</p>
          </div>
          <div className="token-info">
            <h3>Токен доступу:</h3>
            <div className="token-display">
              <code>{user?.accessToken}</code>
            </div>
          </div>
        </div>
      </div>

      <Featured type={type} setGenre={setGenre} />
      {lists.map((list) => (
        <List key={list._id} list={list} />
      ))}
    </div>
  );
};

export default Home;