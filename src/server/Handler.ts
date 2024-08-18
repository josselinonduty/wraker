import {
  Method,
  WrakerHeaders,
  type EventData,
  type EventHeaders,
  type EventPath,
  type WrakerErrorResponse,
  type WrakerRequest,
  type WrakerSuccessResponse,
} from "../common";
import { WrakerRouter } from "./WrakerRouter";

export type WrakerAppNext = (err?: any) => void;
// export type AppRequest = {
//   method: string;
//   path: string;
//   body?: any;
//   headers?: Record<string, string>;
// };
// export type AppRequest = {
//   app: WrakerApp;
//   baseUrl: string;
//   body: any;
//   cookies: Record<string, string>;
//   // fresh: boolean;
//   // hostname: string;
//   // ip: string;
//   // ips: string[];
//   method: string;
//   originalUrl: string;
//   url: string; // almost duplicate of originalUrl
//   params: Record<string, string>;
//   path: string;
//   // protocol: string;
//   query: Record<string, string>;
//   res: AppResponse;
//   route: any;
//   // secure: boolean;
//   // signedCookies: Record<string, string>;
//   // stale: boolean;
//   // subdomains: string[];
//   // xhr: boolean;

//   // accepts: (types: string | string[]) => string | false;
//   // acceptsCharsets: (charsets: string | string[]) => string | false;
//   // acceptsEncodings: (encodings: string | string[]) => string | false;
//   // acceptsLanguages: (langs: string | string[]) => string | false;
//   get: (field: string) => string;
//   is: (type: string | string[]) => string | false;
//   // range: (size: number, options?: any) => any;
// };

// export type AppResponse = {
//   body?: any;
//   error?: any;

//   status: number;
//   headers: Record<string, string>;

//   send: (body: any) => void;
//   json: (body: any) => void;
// };

// export type AppResponse = {
//   app: WrakerApp;
//   locals: Record<any, any>;
//   append: (field: string, value?: string) => void;
//   // attachment: (filename?: string) => void;
//   cookie: (name: string, value: string, options?: any) => void;
//   clearCookie: (name: string, options?: any) => void;
//   // download: (path: string, filename?: string, fn?: any) => void;
//   end: (data: any, encoding?: string) => void;
//   // format: (obj: any) => void;
//   get: (field: string) => string;
//   json: (body: any) => void;
//   jsonp: (body: any) => void;
//   // links: (links: any) => void;
//   // location: (url: string) => void;
//   redirect: (url: string, status?: number) => void;
//   // render: (view: string, options?: any, callback?: any) => void;
//   send: (body: any) => void;
//   // sendFile: (path: string, options?: any, fn?: any) => void;
//   sendStatus: (statusCode: number) => void;
//   set: (field: string, value: string) => AppResponse;
//   status: (code: number) => AppResponse;
//   type: (type: string) => AppResponse;
// };

export interface WrakerAppRequestConstructorOptions extends WrakerRequest {
  sendFn: (args: WrakerSuccessResponse) => void;
  sendErrorFn: (args: WrakerErrorResponse) => void;
}

export class WrakerAppRequest {
  public readonly method: Method;
  public readonly path: EventPath;
  public readonly headers: WrakerHeaders;
  public body: EventData;
  public readonly res: WrakerAppResponse;
  public readonly app: WrakerRouter;

  constructor(app: WrakerRouter, options: WrakerAppRequestConstructorOptions) {
    this.app = app;

    this.method = options.method;
    this.path = options.path;
    this.body = options.body;
    this.headers = new WrakerHeaders(options.headers);

    this.res = new WrakerAppResponse({
      req: this,
      sendFn: options.sendFn,
      sendErrorFn: options.sendErrorFn,
    });
  }
}

export interface WrakerAppResponseOptions {
  req: WrakerAppRequest;
}

export interface WrakerAppResponseConstructorOptions
  extends WrakerAppResponseOptions {
  sendFn: (args: WrakerSuccessResponse) => void;
  sendErrorFn: (args: WrakerErrorResponse) => void;
}

export class WrakerAppResponse implements WrakerAppResponseOptions {
  private _status: number = 0;
  public headers: WrakerHeaders = new WrakerHeaders();
  public body: EventData;
  public req: WrakerAppRequest;

  private _sendFn: (args: WrakerSuccessResponse) => void;
  private _sendErrorFn: (args: WrakerErrorResponse) => void;

  private _finished: boolean = false;

  constructor(options: WrakerAppResponseConstructorOptions) {
    this.req = options.req;
    this._sendFn = options.sendFn;
    this._sendErrorFn = options.sendErrorFn;

    if (this.req.headers.has("X-Request-ID")) {
      this.headers.set("X-Request-ID", this.req.headers.get("X-Request-ID"));
    }
  }

  public get statusCode(): number {
    return this._status;
  }

  public set statusCode(value: number) {
    this._status = value;
  }

  public status(value: number): WrakerAppResponse {
    this._status = value;
    return this;
  }

  public get finished(): boolean {
    return this._finished;
  }

  public send(body: EventData): void {
    this._sendFn({
      headers: this.headers.serialize(),
      status: this.statusCode,
      body: body,
    });

    this.end();
  }

  public json(body: EventData): void {
    try {
      const json = JSON.stringify(body);
      this.headers.set("Content-Type", "application/json");
      this.send(json);
    } catch (error) {
      this._sendErrorFn({
        headers: this.headers.serialize(),
        error: "Body is not a valid JSON object",
        status: 500,
      });
    }

    this.end();
  }

  public end(): void {
    this._finished = true;
  }
}

export type StructuredEventHandler = {
  path: EventPath;
  method: Method;
  handler: EventHandler;
};

export type EventHandler = EventHandlerFn | WrakerRouter;

export type EventHandlerFn = (
  req: WrakerAppRequest,
  res: WrakerAppResponse,
  next: WrakerAppNext
) => void;

// export type ParamEventHandler = (
//   req: AppRequest,
//   res: AppResponse,
//   next: NextHandler,
//   param: string | number
// ) => void;
