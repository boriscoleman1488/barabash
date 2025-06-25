import "./ListItem.scss";
import {
  PlayArrow,
  Add,
  ThumbUpAltOutlined,
  ThumbDownOutlined,
} from "@material-ui/icons";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import YouTube from "react-youtube";

export default function ListItem({ index, item }) {
  const [isHovered, setIsHovered] = useState(false);
  const [movie, setMovie] = useState({});

  //fetch the details of the movie from the API item is the id of the movie

  useEffect(() => {
    const getMovie = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/movies/find/${item}`,
          {
            headers: {
              token:
                "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NDE0MWVmMzFkYzc1MWNjMjg3MTYxMyIsImlzQWRtaW4iOnRydWUsImlhdCI6MTY4MjI2NDg0NywiZXhwIjoxNjg0ODU2ODQ3fQ.tSwm7Ts6jdv8ORP6YQrXw0SvCrLLA-UCmmjOQyyKVko",
            },
          }
        );
        setMovie(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    getMovie();
  }, [item]);

  // console.log(movie);

  return (
    <Link to={{ pathname: "/watch" }} state={{ movie: movie }}>
      <div
        className="listItem"
        style={{ left: isHovered && index * 225 - 50 + index * 2.5 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img src={movie.img} alt="" />
        {isHovered && (
          <>
            {/* <div className="videoContainer">
              <YouTube
                videoId="UaVTIH8mujA"
                opts={{ playerVars: { autoplay: 1 } }}
              />
            </div> */}
            <video src={movie.video} autoPlay={true} />
            <div className="itemInfo">
              <div className="icons">
                <PlayArrow className="icon" />
                <Add className="icon" />
                <ThumbUpAltOutlined className="icon" />
                <ThumbDownOutlined className="icon" />
              </div>
              <div className="itemInfoTop">
                <span>{movie.duration}</span>
                <span className="limit">+{movie.limit}</span>
                <span>{movie.year}</span>
              </div>
              <div className="desc">{movie.desc}</div>
              <div className="genre">{movie.genre}</div>
            </div>
          </>
        )}
      </div>
    </Link>
  );
}
