import "./newProduct.css";
import { useState } from "react";
// import { useLocation } from "react-router-dom";
import storage from "../../firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { createMovie } from "../../context/movieContext/apiCalls";
import { useContext } from "react";
import { MovieContext } from "../../context/movieContext/MovieContext";
import { useNavigate } from "react-router-dom";

export default function NewProduct() {
  const [movie, setMovie] = useState(null);
  const [img, setImg] = useState(null);
  const [imgTitle, setImgTitle] = useState(null);
  const [imgSm, setImgSm] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [video, setVideo] = useState(null);
  const [uploaded, setUploaded] = useState(0);

  const { dispatch } = useContext(MovieContext);

  const Navigate = useNavigate();

  // const location = useLocation();

  const handleChange = (e) => {
    const value = e.target.value;
    setMovie({ ...movie, [e.target.name]: value });
  };

  const upload = async (items) => {
    for (const item of items) {
      const formData = new FormData();
      formData.append("file", item.file);
      formData.append("upload_preset", "g7c0jqlv");

      try {
        const res = await fetch("https://api.cloudinary.com/v1_1/defichscy/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        const fileUrl = data.secure_url;

        // Обновляем состояние movie
        setMovie((prev) => ({
          ...prev,
          [item.name]: fileUrl,
        }));

        // Увеличиваем счётчик загруженных
        setUploaded((prev) => prev + 1);
      } catch (err) {
        console.error("Ошибка при загрузке в Cloudinary:", err);
      }
      /*const fileName = new Date().getTime() + item.name + item.file.name;
      const storageRef = ref(storage, `/items/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, item.file);

      uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
          },
          (error) => {
            console.error("Upload error:", error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((url) => {
              setMovie((prev) => ({
                ...prev,
                [item.name]: url,
              }));
              setUploaded((prev) => prev + 1);
            });
          }
      );*/
    }
  };

  const handleUpload = (e) => {
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

    createMovie(movie, dispatch);
    Navigate("/movies");
  };

  return (
    <div className="newProduct">
      <h1 className="addProductTitle">New Movie</h1>
      <form className="addProductForm">
        <div className="addProductItem">
          <label>Image</label>
          <input
            type="file"
            id="img"
            name="img"
            onChange={(e) => setImg(e.target.files[0])}
          />
        </div>
        <div className="addProductItem">
          <label>Title Image</label>
          <input
            type="file"
            id="imgTitle"
            name="imgTitle"
            onChange={(e) => setImgTitle(e.target.files[0])}
          />
        </div>
        <div className="addProductItem">
          <label>Thumbnail Image</label>
          <input
            type="file"
            id="imgSm"
            name="imgSm"
            onChange={(e) => setImgSm(e.target.files[0])}
          />
        </div>
        <div className="addProductItem">
          <label>Title</label>
          <input
            type="text"
            placeholder="title"
            name="title"
            onChange={handleChange}
          />
        </div>
        <div className="addProductItem">
          <label>Description</label>
          <input
            type="text"
            placeholder="description"
            name="desc"
            onChange={handleChange}
          />
        </div>
        <div className="addProductItem">
          <label>Year</label>
          <input
            type="text"
            placeholder="year"
            name="year"
            onChange={handleChange}
          />
        </div>
        <div className="addProductItem">
          <label>Genre</label>
          <input
            type="text"
            placeholder="genre"
            name="genre"
            onChange={handleChange}
          />
        </div>
        <div className="addProductItem">
          <label>During</label>
          <input
            type="text"
            placeholder="duration"
            name="duration"
            onChange={handleChange}
          />
        </div>
        <div className="addProductItem">
          <label>Limit</label>
          <input
            type="text"
            placeholder="limit"
            name="limit"
            onChange={handleChange}
          />
        </div>
        <div className="addProductItem">
          <label>Is Series?</label>
          <select name="isSeries" id="isSeries" onChange={handleChange}>
            <option value="false">No</option>
            <option value="true">Yes </option>
          </select>
        </div>
        <div className="addProductItem">
          <label>Trailer</label>
          <input
            type="file"
            name="trailer"
            onChange={(e) => setTrailer(e.target.files[0])}
          />
        </div>
        <div className="addProductItem">
          <label>Video</label>
          <input
            type="file"
            name="video"
            onChange={(e) => setVideo(e.target.files[0])}
          />
        </div>
        {uploaded === 5 ? (
          <button className="addProductButton" onClick={handleSubmit}>
            Create
          </button>
        ) : (
          <button className="addProductButton" onClick={handleUpload}>
            Upload
          </button>
        )}
      </form>
    </div>
  );
}
