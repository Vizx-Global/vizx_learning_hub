export class SuccessResponse {
  public readonly success: boolean = true;
  public readonly message: string;
  public readonly data?: any;
  public readonly timestamp: Date;

  constructor(message: string, data?: any, public readonly statusCode: number = 200) {
    this.message = message;
    this.data = data;
    this.timestamp = new Date();
  }

  send(res: any) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp
    });
  }
}