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
      
async function processResult<T>(result: Response): Promise<ApiResponse<T>> {
    let data: any;
    try {
        data = await result.json();
    } catch {
        data = null;
    }

    if (!data && result.status !== 204) {
        return {
            success: false,
            statusCode: result.status,
            message: "EMPTY",
            messageClass: "error.generic",
            debugMessage: result.statusText,
        };
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

    return await processResult<T>(result);
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

    return await processResult<T>(result);
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

    return await processResult<T>(result);
}

export async function postFile<T>(
    path: string,
    opts: { urlParams?: { [key: string]: string }; body: File }
): Promise<ApiResponse<T>> {
    let form = new FormData();
    form.append("files", opts.body, opts.body.name);
    let paramsString: string =
        opts && opts.urlParams
            ? `?${new URLSearchParams(opts.urlParams).toString()}`
            : "";
    let sessionId: string | null = window.localStorage.getItem("sessionId");
    let result: Response = await fetch(
        `/api${path.trimStart()}${paramsString}`,
        {
            headers: sessionId ? { Authorization: sessionId } : undefined,
            body: form,
            method: "POST",
        }
    );

    return await processResult<T>(result);
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

    return await processResult<T>(result);
}
