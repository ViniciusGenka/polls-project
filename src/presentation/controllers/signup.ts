import { Controller, HttpRequest, HttpResponse, EmailValidator } from '../protocols'
import { MissingFieldError, InvalidFieldError } from '../errors'
import { badRequest, serverError } from '../helpers/httpHelper'

export class SignUpController implements Controller {
  private readonly emailValidator: EmailValidator
  constructor (emailValidator: EmailValidator) {
    this.emailValidator = emailValidator
  }

  handle (httpRequest: HttpRequest): HttpResponse {
    try {
      const requiredFields = ['name', 'email', 'password', 'passwordConfirmation']
      for (const field of requiredFields) {
        if (!httpRequest.body[field]) {
          return badRequest(new MissingFieldError(field))
        }
      }
      const emailIsValid = this.emailValidator.isValid(httpRequest.body.email)
      if (!emailIsValid) {
        return badRequest(new InvalidFieldError('email'))
      }
    } catch (error) {
      return serverError()
    }
  }
}
