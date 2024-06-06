export interface WrakerRequest {
  // method: string;
  body: Event;
}

export interface WrakerResponse {
  send: (data: any) => void;
  // json: (data: any) => void;
}

export type WrakerNextFunction = () => void;

export type WrakerHandler = (
  req: WrakerRequest,
  res: WrakerResponse
  // next: WrakerNextFunction
) => void;
