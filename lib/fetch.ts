import { User } from "@/types";
import { auth } from "@/auth";
import { getSession } from "next-auth/react";

export interface QueryParams {
  offset?: number;
  limit?: number;
  sort?: string[][] | { [key: string]: 1 | -1 };
  where?: Record<string, unknown>;
  filters?: Record<string, unknown>;
  select?: string[];
  populate?: string[];
  search?: string;
  data?: Record<string, unknown>;
  pagination?: boolean;
  timezone?: string;
  narrow_search?: string;
}

export interface ApiResponse<T = unknown, TBody = unknown> {
  data?: T;
  error?: unknown;
  validationErrors?: {
    property: keyof TBody;
    constraints: { [key: string]: string };
  }[];
  message?: string;
  statusCode?: number;
  count?: number;
}

export interface HttpOptions {
  secured?: boolean;
  additionalHeaders?: { [key: string]: string };
  isMultipart?: boolean;
}

export const getHttpOption = async (options: HttpOptions): Promise<Headers> => {
  const { secured = true, additionalHeaders, isMultipart } = options;
  const headers = new Headers();
  if (additionalHeaders && Object.keys(additionalHeaders).length) {
    for (const key in additionalHeaders) {
      headers.set(key, additionalHeaders[key]);
    }
  }
  if (!isMultipart) headers.set("Content-Type", "application/json");
  if (!!secured) {
    const session = typeof window === "undefined"
      ? await auth()
      : await getSession();

    if (session?.user) {
      headers.set("Authorization", `Bearer ${(session.user as any).accessToken}`);
    }
  }
  return headers;
};

const API_ENDPOINT =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const generateQueryUrl = (path: string, options?: QueryParams): string => {
  let url = `${API_ENDPOINT}/${path}?`;
  if (typeof options === "undefined") {
    return url;
  }
  if (!isNaN(Number(options.limit))) {
    url += "limit=" + options.limit + "&";
  }
  if (!isNaN(Number(options.offset))) {
    url += "offset=" + options.offset + "&";
  }
  if (options.search && options.search.trim() !== "") {
    url += "search=" + encodeURIComponent(options.search.trim()) + "&";
  }
  if (options.where && typeof options.where === "object") {
    url += "where=" + JSON.stringify(options.where) + "&";
  }
  if (options.sort && Array.isArray(options.sort)) {
    url += "sort=" + JSON.stringify(options.sort) + "&";
  }
  if (options.select && Array.isArray(options.select)) {
    url += "select=" + JSON.stringify(options.select) + "&";
  }
  if (options.populate && Array.isArray(options.populate)) {
    url += "populate=" + JSON.stringify(options.populate) + "&";
  }
  if (options.pagination === false) {
    url += "pagination=N&";
  }
  if (options.data && typeof options.data === "object") {
    for (const key in options.data) {
      if (Object.prototype.hasOwnProperty.call(options.data, key)) {
        url += `${key}=${typeof options.data[key] === "object"
          ? JSON.stringify(options.data[key])
          : options.data[key]
          }&`;
      }
    }
  }
  return url.slice(0, -1);
};

const responseHandler = async (
  response: Response,
  isLogin: boolean = false
) => {
  const res = await response.json();
  const statusCode = res.statusCode ?? response.status;
  if (statusCode === 401) {
    if (!isLogin) {
      // Don't auto-signout, let the component handle it
      // This prevents race conditions during initial session setup
      return {
        ...res,
        error: true,
      };
    }
  }
  if (statusCode === 400 && Array.isArray(res.message)) {
    return {
      ...res,
      message: res.error,
      validationErrors: res.message,
    };
  }
  return { ...res, statusCode };
};

const errorHandler = <T>(error: unknown): ApiResponse<T> => {
  return {
    error,
    message: error instanceof Error ? error.message : "error",
    statusCode: 500,
  };
};

/**
 * login
 *
 * @param entity
 * @param body
 * @param queryParams
 * @param options
 */
interface LoginBody {
  username: string;
  password: string;
  info: { [key: string]: unknown };
}

const Login = async <T>(
  body: LoginBody,
  queryParams?: QueryParams,
  requestInit?: RequestInit
): Promise<ApiResponse<T, LoginBody>> => {
  try {
    const response = await fetch(generateQueryUrl("auth/local", queryParams), {
      method: "POST",
      body: JSON.stringify(body),
      headers: await getHttpOption({ secured: false }),
      ...requestInit,
    });
    return responseHandler(response, true);
  } catch (error) {
    return errorHandler(error);
  }
};

/**
 * fetchMe
 * @param queryParams
 * @param options
 */
const Me = async <T>(
  queryParams?: QueryParams,
  options?: HttpOptions,
  requestInit?: RequestInit
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(generateQueryUrl("user/me", queryParams), {
      method: "GET",
      headers: await getHttpOption(options || {}),
      ...requestInit,
    });
    return responseHandler(response);
  } catch (error) {
    return errorHandler(error);
  }
};

/**
 * fetchUpdateMe
 * @param body
 * @param queryParams
 * @param options
 */
const UpdateMe = async <T>(
  body: Partial<User>,
  queryParams?: QueryParams,
  options?: HttpOptions,
  requestInit?: RequestInit
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(generateQueryUrl("user/me", queryParams), {
      method: "PUT",
      body: JSON.stringify(body),
      headers: await getHttpOption(options || {}),
      ...requestInit,
    });
    return responseHandler(response);
  } catch (error) {
    return errorHandler(error);
  }
};

/**
 * fetchGetAll
 *
 * @param entity
 * @param queryParams
 * @param options
 */
const GetAll = async <T>(
  entity: string,
  queryParams?: QueryParams,
  options?: HttpOptions,
  requestInit?: RequestInit
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(generateQueryUrl(entity, queryParams), {
      method: "GET",
      headers: await getHttpOption(options || {}),
      ...requestInit,
    });
    return responseHandler(response);
  } catch (error) {
    return errorHandler(error);
  }
};

/**
 * fetchGetById
 *
 * @param entity
 * @param id
 * @param queryParams
 * @param options
 */
const GetById = async <T>(
  entity: string,
  id: number | string,
  queryParams?: QueryParams,
  options?: HttpOptions,
  requestInit?: RequestInit
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(
      generateQueryUrl(`${entity}/${id}`, queryParams),
      {
        method: "GET",
        headers: await getHttpOption(options || {}),
        ...requestInit,
      }
    );
    return responseHandler(response);
  } catch (error) {
    return errorHandler(error);
  }
};

/**
 * fetchFind
 *
 * @param entity
 * @param queryParams
 * @param options
 */
const Find = async <T>(
  entity: string,
  queryParams?: QueryParams,
  options?: HttpOptions,
  requestInit?: RequestInit
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(
      generateQueryUrl(`${entity}/find`, queryParams),
      {
        method: "GET",
        headers: await getHttpOption(options || {}),
        ...requestInit,
      }
    );
    return responseHandler(response);
  } catch (error) {
    return errorHandler(error);
  }
};

/**
 * fetchGetCount
 *
 * @param entity
 * @param queryParams
 * @param options
 */
const GetCount = async <T>(
  entity: string,
  queryParams?: QueryParams,
  options?: HttpOptions,
  requestInit?: RequestInit
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(
      generateQueryUrl(`${entity}/count`, queryParams),
      {
        method: "GET",
        headers: await getHttpOption(options || {}),
        ...requestInit,
      }
    );
    return responseHandler(response);
  } catch (error) {
    return errorHandler(error);
  }
};

/**
 * fetchCreate
 *
 * @param entity
 * @param body
 * @param queryParams
 * @param options
 */
const Create = async <TBody, TRes>(
  entity: string,
  body: TBody,
  queryParams?: QueryParams,
  options?: HttpOptions,
  requestInit?: RequestInit
): Promise<ApiResponse<TRes, TBody>> => {
  try {
    const response = await fetch(generateQueryUrl(entity, queryParams), {
      method: "POST",
      body: JSON.stringify(body),
      headers: await getHttpOption(options || {}),
      ...requestInit,
    });
    return responseHandler(response);
  } catch (error) {
    return errorHandler(error);
  }
};

/**
 * fetchUpdateById
 *
 * @param entity
 * @param id
 * @param body
 * @param queryParams
 * @param options
 */
const UpdateById = async <TBody, TRes>(
  entity: string,
  id: number | string,
  body: TBody,
  queryParams?: QueryParams,
  options?: HttpOptions,
  requestInit?: RequestInit
): Promise<ApiResponse<TRes, TBody>> => {
  try {
    const response = await fetch(
      generateQueryUrl(`${entity}/${id}`, queryParams),
      {
        method: "PUT",
        body: JSON.stringify(body),
        headers: await getHttpOption(options || {}),
        ...requestInit,
      }
    );
    return responseHandler(response);
  } catch (error) {
    return errorHandler(error);
  }
};

/**
 * fetchDeleteById
 *
 * @param entity
 * @param id
 * @param queryParams
 * @param options
 */
const DeleteById = async <T>(
  entity: string,
  id: number | string,
  queryParams?: QueryParams,
  options?: HttpOptions,
  requestInit?: RequestInit
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(
      generateQueryUrl(`${entity}/${id}`, queryParams),
      {
        method: "DELETE",
        headers: await getHttpOption(options || {}),
        ...requestInit,
      }
    );
    return responseHandler(response);
  } catch (error) {
    return errorHandler(error);
  }
};

/**
 * fetchGet
 *
 * @param entity
 * @param body
 * @param queryParams
 * @param options
 */
const Get = async (
  entity: string,
  queryParams?: QueryParams,
  options?: HttpOptions,
  requestInit?: RequestInit
): Promise<ApiResponse> => {
  try {
    const response = await fetch(generateQueryUrl(entity, queryParams), {
      method: "GET",
      headers: await getHttpOption(options || {}),
      ...requestInit,
    });
    return responseHandler(response);
  } catch (error) {
    return errorHandler(error);
  }
};

/**
 * fetchPost
 *
 * @param entity
 * @param body
 * @param queryParams
 * @param options
 */
const Post = async <TBody, TResData>(
  entity: string,
  body: TBody,
  queryParams?: QueryParams,
  options?: HttpOptions,
  requestInit?: RequestInit
): Promise<ApiResponse<TResData, TBody>> => {
  try {
    const response = await fetch(generateQueryUrl(entity, queryParams), {
      method: "POST",
      body: JSON.stringify(body),
      headers: await getHttpOption(options || {}),
      ...requestInit,
    });
    return responseHandler(response);
  } catch (error) {
    return errorHandler(error);
  }
};

/**
 * fetchPut
 *
 * @param entity
 * @param body
 * @param queryParams
 * @param options
 */
const Put = async <TBody, TResData>(
  entity: string,
  body: TBody,
  queryParams?: QueryParams,
  options?: HttpOptions,
  requestInit?: RequestInit
): Promise<ApiResponse<TResData, TBody>> => {
  try {
    const response = await fetch(generateQueryUrl(entity, queryParams), {
      method: "PUT",
      body: JSON.stringify(body),
      headers: await getHttpOption(options || {}),
      ...requestInit,
    });
    return responseHandler(response);
  } catch (error) {
    return errorHandler(error);
  }
};

/**
 * fetchPatch
 *
 * @param entity
 * @param body
 * @param queryParams
 * @param options
 */
const Patch = async (
  entity: string,
  body: BodyInit | null,
  queryParams?: QueryParams,
  options?: HttpOptions,
  requestInit?: RequestInit
): Promise<ApiResponse> => {
  try {
    const response = await fetch(generateQueryUrl(entity, queryParams), {
      method: "PATCH",
      body: options?.isMultipart ? body : JSON.stringify(body),
      headers: await getHttpOption(options || {}),
      ...requestInit,
    });
    return responseHandler(response);
  } catch (error) {
    return errorHandler(error);
  }
};

/**
 * fetchDelete
 *
 * @param entity
 * @param body
 * @param queryParams
 * @param options
 */
const Delete = async (
  entity: string,
  queryParams?: QueryParams,
  options?: HttpOptions,
  requestInit?: RequestInit
): Promise<ApiResponse> => {
  try {
    const response = await fetch(generateQueryUrl(entity, queryParams), {
      method: "DELETE",
      headers: await getHttpOption(options || {}),
      ...requestInit,
    });
    return responseHandler(response);
  } catch (error) {
    return errorHandler(error);
  }
};

/**
 * Get dashboard statistics
 */
const DashboardStats = async <T>(
  options?: HttpOptions,
  requestInit?: RequestInit
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(
      generateQueryUrl('user/dashboard-stats'),
      {
        method: "GET",
        headers: await getHttpOption(options || {}),
        ...requestInit,
      }
    );
    return responseHandler(response);
  } catch (error) {
    return errorHandler(error);
  }
};

/**
 * Chat API Methods
 */

const GetMyChats = async (queryParams?: { offset?: number; limit?: number }) => {
  return Get('chat/chats', queryParams);
};

const GetChatMessages = async (
  chatUid: string,
  queryParams?: { offset?: number; limit?: number }
) => {
  return Get(`chat/${chatUid}/messages`, queryParams);
};

const SendMessage = async (data: { toUserUid: string; message: string }) => {
  return Post('chat/send', data);
};

const MarkChatAsRead = async (chatUid: string) => {
  return Get(`chat/${chatUid}/messages/readAll`);
};

const GetChatByUid = async (chatUid: string) => {
  return GetById('chat', chatUid);
};

const CreateChat = async (userUid: string) => {
  return Create('chat', { userUid });
};

/**
 * Subscription API Methods
 */

const GetSubscriptionStatus = async () => {
  return Get('subscription/status');
};

const CreateCheckoutSession = async (data?: { amount?: number; planType?: string }) => {
  return Post('subscription/create-checkout-session', data || {});
};

const ProcessPayment = async (sessionId: string) => {
  return Get(`subscription/process-payment/${sessionId}`);
};

const CancelSubscription = async (immediate: boolean = false) => {
  const params = immediate ? { data: { immediate: 'true' } } : undefined;
  console.log('[CancelSubscription] immediate:', immediate, 'params:', params);
  return Delete('subscription/cancel', params);
};

const ReactivateSubscription = async () => {
  return Post('subscription/reactivate', {});
};

export const API = {
  Create,
  DashboardStats,
  Delete,
  DeleteById,
  Find,
  Get,
  GetAll,
  GetById,
  GetCount,
  Login,
  Me,
  Patch,
  Post,
  Put,
  UpdateById,
  UpdateMe,
  fetch,
  // Chat methods
  GetMyChats,
  GetChatMessages,
  SendMessage,
  MarkChatAsRead,
  GetChatByUid,
  CreateChat,
  // Subscription methods
  GetSubscriptionStatus,
  CreateCheckoutSession,
  ProcessPayment,
  CancelSubscription,
  ReactivateSubscription,
};
