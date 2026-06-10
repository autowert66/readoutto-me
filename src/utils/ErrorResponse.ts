type ErrorResponseOptions = {
  status?: number;
};

export class ErrorResponse extends Response {
  constructor(msg: string, options?: Partial<ErrorResponseOptions>) {
    const status = options?.status || 400;
    const body = {
      success: false,
      error: {
        name: 'GenericError',
        message: msg,
      },
    };

    super(JSON.stringify(body), {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
