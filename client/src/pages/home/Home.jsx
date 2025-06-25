import Navbar from "../../components/navbar/Navbar";
import Featured from "../../components/featured/Featured";
import "./Home.scss";
import List from "../../components/list/List";
import { useEffect, useState } from "react";
import axios from "axios";

const Home = ({ type }) => {
  const [lists, setLists] = useState([]);
  const [genre, setGenre] = useState(null);

  useEffect(() => {
    const getRandomLists = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/lists${type ? `?type=${type}` : ""}${
            genre ? `&genre=${genre}` : ""
          }`,
          {
            headers: {
              token:
                "Bearer " +
                JSON.parse(localStorage.getItem("user")).accessToken,
            },
          }
        );

        // console.log(res);
        setLists(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    getRandomLists();
  }, [type, genre]);

  return (
    <div className="home">
      <Navbar />
      <Featured type={type} setGenre={setGenre} />
      {lists.map((list) => (
        <List key={list._id} list={list} /> // Add key prop with a unique value, in this example assuming list._id is a unique identifier
      ))}
    </div>
  );
};

export default Home;
