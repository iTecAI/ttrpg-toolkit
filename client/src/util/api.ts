import { loc } from "./localization";

export type ApiResponse<T> =
    | { success: true; value: T }
    | {
          success: false;
          message: string;
          messageClass: string;
          debugMessage: string;
          statusCode: number;
      };

export async function get<T>(
    path: string,
    opts?: { urlParams?: { [key: string]: string } }
): Promise<ApiResponse<T>> {
    let paramsString: string =
        opts && opts.urlParams
            ? `?${new URLSearchParams(opts.urlParams).toString()}`
            : "";
    let sessionId: string | null = window.localStorage.getItem("sessionId");
    let result: Response = await fetch(
        `/api${path.trimStart()}${paramsString}`,
        {
            headers: sessionId ? { Authorization: sessionId } : undefined,
            method: "GET",
        }
    );

    let data: any;
    try {
        data = await result.json();
    } catch {
        data = null;
    }

    if (result.status < 400) {
        return {
            success: true,
            value: data,
        };
    } else {
        if (typeof data.detail === "string") {
            data.detail = JSON.parse(data.detail);
        }
        return {
            success: false,
            message: data.detail.messageClass
                ? loc(data.detail.messageClass, { extra: data.extra })
                : loc("error.generic"),
            messageClass: data.detail.messageClass ?? "error.generic",
            debugMessage: data.detail.message ?? "Generic error",
            statusCode: result.status,
        };
    }
}

export async function del<T>(
    path: string,
    opts?: { urlParams?: { [key: string]: string } }
): Promise<ApiResponse<T>> {
    let paramsString: string =
        opts && opts.urlParams
            ? `?${new URLSearchParams(opts.urlParams).toString()}`
            : "";
    let sessionId: string | null = window.localStorage.getItem("sessionId");
    let result: Response = await fetch(
        `/api${path.trimStart()}${paramsString}`,
        {
            headers: sessionId ? { Authorization: sessionId } : undefined,
            method: "DELETE",
        }
    );

    let data: any;
    try {
        data = await result.json();
    } catch {
        data = null;
    }
    if (result.status < 400) {
        return {
            success: true,
            value: data,
        };
    } else {
        if (typeof data.detail === "string") {
            data.detail = JSON.parse(data.detail);
        }
        return {
            success: false,
            message: data.detail.messageClass
                ? loc(data.detail.messageClass, { extra: data.extra })
                : loc("error.generic"),
            messageClass: data.detail.messageClass ?? "error.generic",
            debugMessage: data.detail.message ?? "Generic error",
            statusCode: result.status,
        };
    }
}

export async function post<T>(
    path: string,
    opts?: { urlParams?: { [key: string]: string }; body?: any }
): Promise<ApiResponse<T>> {
    let paramsString: string =
        opts && opts.urlParams
            ? `?${new URLSearchParams(opts.urlParams).toString()}`
            : "";
    let sessionId: string | null = window.localStorage.getItem("sessionId");
    let result: Response = await fetch(
        `/api${path.trimStart()}${paramsString}`,
        {
            headers: sessionId ? { Authorization: sessionId } : undefined,
            body: opts && opts.body ? JSON.stringify(opts.body) : undefined,
            method: "POST",
        }
    );

    let data: any;
    try {
        data = await result.json();
    } catch (e) {
        data = null;
    }

    if (result.status < 400) {
        return {
            success: true,
            value: data,
        };
    } else {
        if (typeof data.detail === "string") {
            data.detail = JSON.parse(data.detail);
        }
        return {
            success: false,
            message: data.detail.messageClass
                ? loc(data.detail.messageClass, { extra: data.extra })
                : loc("error.generic"),
            messageClass: data.detail.messageClass ?? "error.generic",
            debugMessage: data.detail.message ?? "Generic error",
            statusCode: result.status,
        };
    }
}

export async function patch<T>(
    path: string,
    opts?: { urlParams?: { [key: string]: string }; body?: any }
): Promise<ApiResponse<T>> {
    let paramsString: string =
        opts && opts.urlParams
            ? `?${new URLSearchParams(opts.urlParams).toString()}`
            : "";
    let sessionId: string | null = window.localStorage.getItem("sessionId");
    let result: Response = await fetch(
        `/api${path.trimStart()}${paramsString}`,
        {
            headers: sessionId ? { Authorization: sessionId } : undefined,
            body: opts && opts.body ? JSON.stringify(opts.body) : undefined,
            method: "PATCH",
        }
    );

    let data: any;
    try {
        data = await result.json();
    } catch {
        data = null;
    }
    if (result.status < 400) {
        return {
            success: true,
            value: data,
        };
    } else {
        if (typeof data.detail === "string") {
            data.detail = JSON.parse(data.detail);
        }
        return {
            success: false,
            message: data.detail.messageClass
                ? loc(data.detail.messageClass, { extra: data.extra })
                : loc("error.generic"),
            messageClass: data.detail.messageClass ?? "error.generic",
            debugMessage: data.detail.message ?? "Generic error",
            statusCode: result.status,
        };
    }
}
