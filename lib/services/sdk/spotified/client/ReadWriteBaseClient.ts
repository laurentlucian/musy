import type { RequestArgs } from "../types/index.js";
import ReadOnlyBaseClient from "./ReadOnlyBaseClient.js";

export abstract class ReadWriteBaseClient extends ReadOnlyBaseClient {
  protected async post<T>(
    url: string,
    data?: Record<string, any>,
    requestArgs?: Partial<RequestArgs>,
  ): Promise<T> {
    const options = {
      method: "post",
      url,
      data,
      ...requestArgs,
    };

    const res = await this._requestMaker.makeRequest<T>(options);

    return res.data;
  }

  protected async put<T>(
    url: string,
    data?: Record<string, any> | string,
    requestArgs?: Partial<RequestArgs>,
  ): Promise<T> {
    const options = {
      method: "put",
      url,
      data,
      ...requestArgs,
    };

    const res = await this._requestMaker.makeRequest<T>(options);

    return res.data;
  }

  protected async delete<T>(
    url: string,
    data?: Record<string, any>,
    requestArgs?: Partial<RequestArgs>,
  ): Promise<T> {
    const options = {
      method: "delete",
      url,
      data,
      ...requestArgs,
    };

    const res = await this._requestMaker.makeRequest<T>(options);

    return res.data;
  }
}

export default ReadWriteBaseClient;
