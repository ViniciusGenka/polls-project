import { UserAccountModel } from '../models/user-account'

export interface CreateUserAccountModel {
  name: string
  email: string
  password: string
}

export interface CreateUserAccount {
  execute (userAccount: CreateUserAccountModel): Promise<UserAccountModel>
}
