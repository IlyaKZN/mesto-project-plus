const ERROR_CODE = 400;

class IncorrectDataError extends Error {
  statusCode: number;

  constructor(message: string) {
    super(message);
    this.statusCode = ERROR_CODE;
  }
}

export default IncorrectDataError;
