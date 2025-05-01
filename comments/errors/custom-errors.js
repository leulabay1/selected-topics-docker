class CustomError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}

class BadRequestError extends CustomError {
  constructor(message) {
    super(message);
    this.statusCode = 400;
  }
}

class NotFoundError extends CustomError {
  constructor(message = 'Not Found') {
    super(message);
    this.statusCode = 404;
  }
}

class DatabaseError extends CustomError {
  constructor(message = 'Database Error') {
    super(message);
    this.statusCode = 500;
  }
}

class ValidationError extends CustomError {
  constructor(errors) {
    super('Validation Error');
    this.statusCode = 400;
    this.errors = errors;
  }

  serializeErrors() {
    return this.errors.map(err => ({
      message: err.message,
      field: err.field
    }));
  }
}

module.exports = {
  CustomError,
  BadRequestError,
  NotFoundError,
  DatabaseError,
  ValidationError
}; 