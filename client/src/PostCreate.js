import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

const PostCreate = () => {
  const [state, setState] = useState({
    title: '',
    submitting: false,
    error: null,
    success: false
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!state.title.trim()) {
      setState((prev) => ({ ...prev, error: 'Title cannot be empty' }));
      return;
    }

    setState((prev) => ({
      ...prev,
      submitting: true,
      error: null,
      success: false
    }));

    try {
      await axios.post(
        `${API_BASE_URL}/posts`,
        { title: state.title },
        { timeout: 5000 }
      );

      setState((prev) => ({
        ...prev,
        title: '',
        submitting: false,
        success: true
      }));

      setTimeout(() => {
        setState((prev) => ({ ...prev, success: false }));
      }, 3000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.statusText ||
        error.message ||
        'Failed to create post';

      setState((prev) => ({
        ...prev,
        submitting: false,
        error: errorMessage
      }));
    }
  };

  const handleInputChange = (e) => {
    setState((prev) => ({
      ...prev,
      title: e.target.value,
      error: null
    }));
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className="card-body">
        <h4 className="card-title mb-4">Create a New Post</h4>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="postTitle" className="form-label fw-semibold">
              Title
            </label>
            <input
              id="postTitle"
              type="text"
              className={`form-control ${state.error ? 'is-invalid' : ''}`}
              value={state.title}
              onChange={handleInputChange}
              disabled={state.submitting}
              aria-describedby="titleHelp"
              placeholder="e.g., My first post"
            />
            <div id="titleHelp" className="form-text">
              Enter a descriptive title for your post
            </div>
            {state.error && (
              <div className="invalid-feedback">{state.error}</div>
            )}
          </div>

          <div className="d-flex justify-content-between align-items-center">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={state.submitting || !state.title.trim()}
            >
              {state.submitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </button>

            {state.success && (
              <span className="text-success small ms-3">
                <i className="bi bi-check-circle me-1"></i>
                Post created successfully!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PostCreate;
