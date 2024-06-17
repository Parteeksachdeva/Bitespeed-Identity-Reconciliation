import { ValidationError } from "express-validation";
import { Request, Response, NextFunction } from "express";

function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof ValidationError) {
    return res.status(err.statusCode).json(err);
  }

  // Handle other errors
  return res.status(500).json({
    message: "An unexpected error occurred",
    error: err.message,
  });
}

export default errorHandler;
