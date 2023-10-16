export interface IUser {
  id: number;
  username: string;
  email: string;
  provider: string;
  password: string;
  resetPasswordToken: null;
  confirmationToken: null;
  confirmed: true;
  blocked: false;
  createdAt: string;
  updatedAt: string;
  role: {
    id: 1;
    name: string;
    description: string;
    type: string;
    createdAt: string;
    updatedAt: string;
  };
}
