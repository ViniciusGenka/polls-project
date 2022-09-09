import { UserAccountModel } from '../models/userAccount'

export interface CreateUserAccountModel {
  name: string
  email: string
  password: string
}

export interface CreateUserAccount {
  execute (userAccount: CreateUserAccountModel): UserAccountModel
}
