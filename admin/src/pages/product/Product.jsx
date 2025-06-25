import { Link } from "react-router-dom";
import "./product.css";
import { Publish } from "@material-ui/icons";
import { useState } from "react";
import { updateMovie, getMovie } from "../../context/movieContext/apiCalls";
import { useContext } from "react";
import { MovieContext } from "../../context/movieContext/MovieContext";
import storage from "../../firebase";
import { useNavigate } from "react-router-dom";

import { useLocation } from "react-router-dom";

export default function Product() {
  const location = useLocation();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(location.state); // Changed from moviee to movie

  // console.log(movie);

  const [img, setImg] = useState(null);
  const [imgTitle, setImgTitle] = useState(null);
  const [imgSm, setImgSm] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [video, setVideo] = useState(null);
  const [uploaded, setUploaded] = useState(0);

  const { dispatch } = useContext(MovieContext);

  // const location = useLocation();

  const handleChange = (e) => {
    const value = e.target.value;
    setMovie({ ...movie, [e.target.name]: value });
  };

  const upload = (items) => {
    items.forEach((item) => {
      const fileName = new Date().getTime() + item.name + item.file.name;
      const uploadTask = storage.ref(`/items/${fileName}`).put(item.file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          console.log(error);
        },
        () => {
          uploadTask.snapshot.ref.getDownloadURL().then((url) => {
            setMovie((prev) => {
              return { ...prev, [item.name]: url };
            });
            setUploaded((prev) => prev + 1);
          });
        }
      );
    });
  };

  const handleUpload = (e) => {
    console.log("upload");
    e.preventDefault();
    upload([
      { file: img, name: "img" },
      { file: imgTitle, name: "imgTitle" },
      { file: imgSm, name: "imgSm" },
      { file: trailer, name: "trailer" },
      { file: video, name: "video" },
    ]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMovie(movie._id, movie, dispatch);
    // Navigate("/movies");
    navigate("/movies");
  };

  return (
    <div className="product">
      <div className="productTitleContainer">
        <h1 className="productTitle">Movie</h1>
        <Link to="/newproduct">
          <button className="productAddButton">Create</button>
        </Link>
      </div>
      <div className="productTop">
        <div className="productTopRight">
          <div className="productInfoTop">
            <img src={movie.img} alt="" className="productInfoImg" />
            <span className="productName">{movie.title}</span>
          </div>
          <div className="productInfoBottom">
            <div className="productInfoItem">
              <span className="productInfoKey">id:</span>
              <span className="productInfoValue">{movie._id}</span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoKey">Genre:</span>
              <span className="productInfoValue">{movie.genre}</span>
            </div>

            <div className="productInfoItem">
              <span className="productInfoKey">year:</span>
              <span className="productInfoValue">{movie.year}</span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoKey">limit:</span>
              <span className="productInfoValue">{movie.limit}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="productBottom">
        <form className="productForm">
          <div className="productFormLeft">
            <label>Movie Title</label>
            <input
              type="text"
              placeholder={movie.title}
              name="title"
              onChange={handleChange}
            />
            <label>Movie Year</label>
            <input
              type="text"
              placeholder={movie.year}
              name="year"
              onChange={handleChange}
            />
            <label>Movie Genre</label>
            <input
              type="text"
              placeholder={movie.genre}
              name="genre"
              onChange={handleChange}
            />
            <label>Movie Limit</label>
            <input
              type="text"
              placeholder={movie.limit}
              name="limit"
              onChange={handleChange}
            />
            <label>Movie Trailer</label>
            <input
              type="file"
              name="trailer"
              src={movie.trailer}
              onChange={(e) => setTrailer(e.target.files[0])}
            />
            <label>Movie Video</label>
            <input
              type="file"
              name="video"
              src={movie.video}
              onChange={(e) => setVideo(e.target.files[0])}
            />
          </div>
          <div className="productFormRight">
            <div className="productUpload">
              <img src={movie.img} alt="" className="productUploadImg" />
              <label htmlFor="img">
                <Publish className="productUploadIcon" />
              </label>
              <input
                type="file"
                src={movie.img}
                id="img"
                style={{ display: "none" }}
                name="img"
                onChange={(e) => setImg(e.target.files[0])}
              />
            </div>
            <div className="productUpload">
              <img src={movie.imgTitle} alt="" className="productUploadImg" />
              <label htmlFor="imgTitle">
                <Publish className="productUploadIcon" />
              </label>
              <input
                type="file"
                src={movie.imgTitle}
                id="imgTitle"
                style={{ display: "none" }}
                name="imgTitle"
                onChange={(e) => setImgTitle(e.target.files[0])}
              />
            </div>
            <div className="productUpload">
              <img src={movie.imgSm} alt="" className="productUploadImg" />
              <label htmlFor="imgSm">
                <Publish className="productUploadIcon" />
              </label>
              <input
                type="file"
                src={movie.imgSm}
                id="imgSm"
                style={{ display: "none" }}
                name="imgSm"
                onChange={(e) => setImgSm(e.target.files[0])}
              />
            </div>
            <button className="productButton" onClick={handleSubmit}>
              Update
            </button>
            {uploaded === 5 ? (
              <button className="productButton" onClick={handleUpload}>
                Upload
              </button>
            ) : (
              <button className="productButton" onClick={handleUpload}>
                Uploading...
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
