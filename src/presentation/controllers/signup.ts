import { HttpRequest, HttpResponse } from '../protocols/http'
import { MissingFieldError } from '../errors/missingFieldError'
import { badRequest } from '../helpers/httpHelper'
export class SignUpController {
  handle (httpRequest: HttpRequest): HttpResponse {
    if (!httpRequest.body.name) {
      return badRequest(new MissingFieldError('name'))
    }
    if (!httpRequest.body.email) {
      return badRequest(new MissingFieldError('email'))
    }
  }
}
