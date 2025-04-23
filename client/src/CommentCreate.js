import { useState } from "react";
import axios from "axios";


const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:4001";

const CommentCreate = ({ postId }) => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setContent(e.target.value);
    if (error) setError(""); 
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(`${API_BASE_URL}/${postId}/comments`, {
        content,
      });
      setContent("");
    } catch (err) {
      setError("Failed to submit comment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card my-3 shadow-sm">
      <div className="card-body">
        <form onSubmit={onSubmit}>
          <div className="mb-3">
            <label htmlFor="commentInput" className="form-label fw-bold">
              Add a Comment
            </label>
            <input
              id="commentInput"
              type="text"
              value={content}
              onChange={handleInputChange}
              className="form-control"
              placeholder="Write your comment here..."
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div className="alert alert-danger py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Comment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CommentCreate;
