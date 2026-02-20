import { Response } from 'express';
import { ApiResponse, FieldValidationError, PaginatedResponse } from '../types/api.types';

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode?: number,
  message?: string
): void;
export function sendSuccess<T>(
  res: Response,
  data: T,
  message?: string
): void;
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCodeOrMessage?: number | string,
  message?: string
): void {
  let statusCode = 200;
  let msg: string | undefined;

  if (typeof statusCodeOrMessage === 'number') {
    statusCode = statusCodeOrMessage;
    msg = message;
  } else {
    msg = statusCodeOrMessage;
  }

  const response: ApiResponse<T> = { success: true, data, message: msg };
  res.status(statusCode).json(response);
}

export function sendCreated<T>(res: Response, data: T, message?: string): void {
  sendSuccess(res, data, 201, message);
}

export function sendPaginated<T>(
  res: Response,
  payload: PaginatedResponse<T>
): void {
  const response: ApiResponse<PaginatedResponse<T>> = {
    success: true,
    data: payload,
  };
  res.status(200).json(response);
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  errors?: FieldValidationError[]
): void {
  const response: ApiResponse<null> = { success: false, message, errors };
  res.status(statusCode).json(response);
}
