import { HttpRequest, HttpResponse } from '../protocols/http'
import { MissingFieldError } from '../errors/missingFieldError'
import { badRequest } from '../helpers/httpHelper'
export class SignUpController {
  handle (httpRequest: HttpRequest): HttpResponse {
    const requiredFields = ['name', 'email', 'password', 'passwordConfirmation']
    for (const field of requiredFields) {
      if (!httpRequest.body[field]) {
        return badRequest(new MissingFieldError(field))
      }
    }
  }
}
