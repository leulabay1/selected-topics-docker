import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CommentCreate from './CommentCreate';
import CommentList from './CommentList';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4002';

const PostList = () => {
  const [state, setState] = useState({
    posts: {},
    loading: true,
    error: null
  });

  const fetchPosts = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await axios.get(`${API_BASE_URL}/posts`, { timeout: 5000 });

      setState({
        posts: response.data,
        loading: false,
        error: null
      });
    } catch (error) {
      const errorMessage = error.response?.status
        ? `Request failed with status ${error.response.status}`
        : error.message || 'Failed to fetch posts';

      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));

      console.error('Error fetching posts:', error);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const renderPostCard = (post) => (
    <article
      className="card shadow-sm"
      style={{ width: '30%', minWidth: 280 }}
      key={post.id}
    >
      <div className="card-body">
        <h5 className="card-title">{post.title}</h5>
        <CommentList comments={post.comments} />
        <CommentCreate postId={post.id} />
      </div>
    </article>
  );

  if (state.loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading posts...</span>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="alert alert-danger" role="alert">
        <p className="mb-2">{state.error}</p>
        <button
          className="btn btn-sm btn-outline-danger"
          onClick={fetchPosts}
        >
          Retry
        </button>
      </div>
    );
  }

  if (Object.keys(state.posts).length === 0) {
    return (
      <div className="alert alert-info" role="alert">
        No posts available. Create one to get started!
      </div>
    );
  }

  return (
    <section className="d-flex flex-wrap gap-3 justify-content-start">
      {Object.values(state.posts).map(renderPostCard)}
    </section>
  );
};

export default PostList;
