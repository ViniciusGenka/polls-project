import { HttpRequest, HttpResponse } from '../protocols/http'
import { MissingFieldError } from '../errors/missingFieldError'
export class SignUpController {
  handle (httpRequest: HttpRequest): HttpResponse {
    if (!httpRequest.body.name) {
      return {
        statusCode: 400,
        body: new MissingFieldError('name')
      }
    }
    if (!httpRequest.body.email) {
      return {
        statusCode: 400,
        body: new MissingFieldError('email')
      }
    }
  }
}
