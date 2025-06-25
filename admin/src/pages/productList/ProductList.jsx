import "./productList.css";
import { DataGrid } from "@material-ui/data-grid";
import { DeleteOutline } from "@material-ui/icons";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { MovieContext } from "../../context/movieContext/MovieContext";
import { useContext } from "react";
import {
  getMovies,
  updateMovie,
  deleteMovie,
} from "../../context/movieContext/apiCalls";

export default function ProductList() {
  const { movies, dispatch } = useContext(MovieContext);

  useEffect(() => {
    getMovies(dispatch);
  }, [dispatch]);

  const handleDelete = (id) => {
    deleteMovie(id, dispatch);
  };

  const columns = [
    { field: "_id", headerName: "ID", width: 150 },
    {
      field: "movie",
      headerName: "Movie",
      width: 150,
      renderCell: (params) => {
        return (
          <div className="productListItem">
            <img className="productListImg" src={params.row.img} alt="" />
            {params.row.title}
          </div>
        );
      },
    },
    { field: "genre", headerName: "Genre", width: 150 },
    { field: "year", headerName: "Year", width: 150 },
    { field: "limit", headerName: "Limit", width: 150 },
    { field: "isSeries", headerName: "Series", width: 150 },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params) => {
        return (
          <>
            <Link to={"/product/" + params.row._id} state={params.row}>
              <button
                className="productListEdit"
                onClick={() =>
                  dispatch({ type: "UPDATE_MOVIE_START", payload: params.row })
                }
              >
                Edit
              </button>
            </Link>
            <DeleteOutline
              className="productListDelete"
              onClick={() => handleDelete(params.row._id)}
            />
          </>
        );
      },
    },
  ];

  return (
    <div className="productList">
      <Link to="/newproduct">
        <button className="productAddButton">Create</button>
      </Link>
      <DataGrid
        rows={movies}
        disableSelectionOnClick
        columns={columns}
        checkboxSelection
        getRowId={(r) => r._id}
      />
    </div>
  );
}
