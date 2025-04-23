import { useState, useEffect } from "react";
import axios from "axios";


const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:4001";

const CommentList = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await axios.get(`${API_BASE_URL}/${postId}/comments`);
        setComments(res.data);
      } catch (err) {
        setError("Failed to load comments. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const renderContent = (comment) => {
    if (comment.status === "approved") return comment.content;
    if (comment.status === "pending") return "This comment is awaiting moderation";
    if (comment.status === "rejected") return "This comment has been rejected";
  };

  return (
    <div className="my-3">
      <h6 className="fw-bold">Comments</h6>

      {loading && (
        <div className="text-muted small">Loading comments...</div>
      )}

      {error && (
        <div className="alert alert-danger py-2">{error}</div>
      )}

      {!loading && !error && (
        <ul className="list-group">
          {comments.map((comment) => (
            <li key={comment.id} className="list-group-item">
              {renderContent(comment)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CommentList;
