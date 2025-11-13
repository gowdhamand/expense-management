export interface User {
  userid: number;
  fullname: string;
  email: string;
  phone_number: string;
  created_at: Date;
}

export interface UserCreateDTO {
  fullname: string;
  email: string;
  phone_number: string;
}

export interface UserUpdateDTO {
  fullname?: string;
  email?: string;
  phone_number?: string;
}

export interface UserQueryParams {
  userId?: number;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
}
