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

export interface Result {
  order: {
    id: number;
    status: string;
    type: string;
    createdAt: Date;
    updatedAt: Date;
  };
  order_meta: {
    shipping_postcode: string;
    shipping_firstname: string;
  };
}
