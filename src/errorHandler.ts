export class ErrorHandler extends Error {
  constructor(message: string) {
    super(message);
    this.name = message;
  }
}
