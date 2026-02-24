import { NextResponse } from "next/server";

/**
 * Standardized API response helper
 * Ensures consistent response format across all endpoints
 */

export const ApiResponse = {
  success: (data = null, statusCode = 200, message = "Success") => {
    return NextResponse.json(
      {
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  },

  error: (message = "Internal Server Error", statusCode = 500, details = null) => {
    return NextResponse.json(
      {
        success: false,
        message,
        details,
        timestamp: new Date().toISOString(),
      },
      { status: statusCode }
    );
  },

  created: (data, message = "Resource created successfully") => {
    return ApiResponse.success(data, 201, message);
  },

  badRequest: (message = "Bad Request", details = null) => {
    return ApiResponse.error(message, 400, details);
  },

  unauthorized: (message = "Unauthorized access") => {
    return ApiResponse.error(message, 401);
  },

  forbidden: (message = "Forbidden") => {
    return ApiResponse.error(message, 403);
  },

  notFound: (message = "Resource not found") => {
    return ApiResponse.error(message, 404);
  },

  conflict: (message = "Resource already exists") => {
    return ApiResponse.error(message, 409);
  },

  serverError: (message = "Internal Server Error", details = null) => {
    return ApiResponse.error(message, 500, details);
  },
};

export default ApiResponse;
