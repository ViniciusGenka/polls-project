import { Controller, HttpRequest, HttpResponse, EmailValidator, PasswordValidator, CreateUserAccount } from './signupProtocols'
import { MissingFieldError, InvalidFieldError } from '../../errors'
import { badRequest, serverError } from '../../helpers/httpHelper'

export class SignUpController implements Controller {
  private readonly emailValidator: EmailValidator
  private readonly passwordValidator: PasswordValidator
  private readonly createUserAccount: CreateUserAccount
  constructor (emailValidator: EmailValidator, passwordValidator: PasswordValidator, createUserAccount: CreateUserAccount) {
    this.emailValidator = emailValidator
    this.passwordValidator = passwordValidator
    this.createUserAccount = createUserAccount
  }

  handle (httpRequest: HttpRequest): HttpResponse {
    try {
      const requiredFields = ['name', 'email', 'password', 'passwordConfirmation']
      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          return badRequest(new MissingFieldError(field))
        }
      }
      const { name, email, password, passwordConfirmation } = httpRequest.body
      const passwordIsValid = this.passwordValidator.isValid(password)
      if (!passwordIsValid) {
        return badRequest(new InvalidFieldError('password'))
      }
      const passwordConfirmationIsMatching = this.passwordValidator.confirmationIsMatching(password, passwordConfirmation)
      if (!passwordConfirmationIsMatching) {
        return badRequest(new InvalidFieldError('passwordConfirmation'))
      }
      const emailIsValid = this.emailValidator.isValid(email)
      if (!emailIsValid) {
        return badRequest(new InvalidFieldError('email'))
      }
      const userAccount = this.createUserAccount.execute({
        name,
        email,
        password
      })
      return {
        statusCode: 200,
        body: userAccount
      }
    } catch (error) {
      return serverError()
    }
  }
}
