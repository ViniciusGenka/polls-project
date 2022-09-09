import { SignUpController } from './signup'
import { MissingFieldError, InvalidFieldError, ServerError } from '../errors'
import { EmailValidator, PasswordValidator } from '../protocols'
import { UserAccountModel } from '../../domain/models/userAccount'
import { CreateUserAccount, CreateUserAccountModel } from '../../domain/useCases/createUserAccount'

interface Sut {
  sut: SignUpController
  emailValidatorStub: EmailValidator,
  passwordValidatorStub: PasswordValidator,
  createUserAccountStub: CreateUserAccount
}

const makeEmailValidator = () => {
  class EmailValidatorStub implements EmailValidator {
    isValid (email: string): boolean {
      return true
    }
  }
  return new EmailValidatorStub()
}

const makePasswordValidator = () => {
  class PasswordValidatorStub implements PasswordValidator {
    isValid (password: string): boolean {
      return true
    }

    confirmationIsMatching (password: string, passwordConfirmation: string): boolean {
      return true
    }
  }
  return new PasswordValidatorStub()
}

const makeCreateUserAccount = () => {
  class CreateUserAccountStub implements CreateUserAccount {
    execute (userAccount: CreateUserAccountModel): UserAccountModel {
      const fakeAccount = {
        id: 'id',
        name: 'name',
        email: 'email',
        password: 'password'
      }
      return fakeAccount
    }
  }
  return new CreateUserAccountStub()
}

const makeSut = (): Sut => {
  const emailValidatorStub = makeEmailValidator()
  const passwordValidatorStub = makePasswordValidator()
  const createUserAccountStub = makeCreateUserAccount()
  const sut = new SignUpController(emailValidatorStub, passwordValidatorStub, createUserAccountStub)
  return {
    sut,
    emailValidatorStub,
    passwordValidatorStub,
    createUserAccountStub
  }
}

describe('SignUp Controller', () => {
  it('should return status code 400 if no name is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'email@example.com',
        password: 'password',
        passwordConfirmation: 'password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingFieldError('name'))
  })

  it('should return status code 400 if no email is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'name',
        password: 'password',
        passwordConfirmation: 'password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingFieldError('email'))
  })

  it('should return status code 400 if no password is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'name',
        email: 'email@example.com',
        passwordConfirmation: 'password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingFieldError('password'))
  })

  it('should return status code 400 if no passwordConfirmation is provided', () => {
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        name: 'name',
        email: 'email@example.com',
        password: 'password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingFieldError('passwordConfirmation'))
  })

  it('should return status code 400 if passwordConfirmation doesn\'t match the password', () => {
    const { sut, passwordValidatorStub } = makeSut()
    jest.spyOn(passwordValidatorStub, 'confirmationIsMatching').mockReturnValue(false)
    const httpRequest = {
      body: {
        name: 'name',
        email: 'email@example.com',
        password: 'password',
        passwordConfirmation: 'notEqualToPassword'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidFieldError('passwordConfirmation'))
  })

  it('should return status code 400 if an invalid password is provided', () => {
    const { sut, passwordValidatorStub } = makeSut()
    jest.spyOn(passwordValidatorStub, 'isValid').mockReturnValue(false)
    const httpRequest = {
      body: {
        name: 'name',
        email: 'email@example.com',
        password: 'password',
        passwordConfirmation: 'password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidFieldError('password'))
  })

  it('should ensure that PasswordValidator\'s isValid and confirmationIsMatching methods are being called with the requested password and password confirmation', () => {
    const { sut, passwordValidatorStub } = makeSut()
    const isValidMethodSpy = jest.spyOn(passwordValidatorStub, 'isValid')
    const confirmationIsMatchingMethodSpy = jest.spyOn(passwordValidatorStub, 'confirmationIsMatching')
    const httpRequest = {
      body: {
        name: 'name',
        email: 'email@example.com',
        password: 'password',
        passwordConfirmation: 'password'
      }
    }
    sut.handle(httpRequest)
    expect(isValidMethodSpy).toHaveBeenCalledWith(httpRequest.body.password)
    expect(confirmationIsMatchingMethodSpy).toHaveBeenCalledWith(httpRequest.body.password, httpRequest.body.passwordConfirmation)
  })

  it('should return status code 500 if PasswordValidator throws an error in isValid method', () => {
    const { sut, passwordValidatorStub } = makeSut()
    jest.spyOn(passwordValidatorStub, 'isValid').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpRequest = {
      body: {
        name: 'name',
        email: 'email@example.com',
        password: 'password',
        passwordConfirmation: 'password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  it('should return status code 500 if PasswordValidator throws an error in confirmationIsMatching method', () => {
    const { sut, passwordValidatorStub } = makeSut()
    jest.spyOn(passwordValidatorStub, 'confirmationIsMatching').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpRequest = {
      body: {
        name: 'name',
        email: 'email@example.com',
        password: 'password',
        passwordConfirmation: 'password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  it('should return status code 400 if an invalid email is provided', () => {
    const { sut, emailValidatorStub } = makeSut()
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValue(false)
    const httpRequest = {
      body: {
        name: 'name',
        email: 'email@example.com',
        password: 'password',
        passwordConfirmation: 'password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidFieldError('email'))
  })

  it('should ensure that EmailValidator\'s isValid method is being called with the requested email', () => {
    const { sut, emailValidatorStub } = makeSut()
    const isValidMethodSpy = jest.spyOn(emailValidatorStub, 'isValid')
    const httpRequest = {
      body: {
        name: 'name',
        email: 'email@example.com',
        password: 'password',
        passwordConfirmation: 'password'
      }
    }
    sut.handle(httpRequest)
    expect(isValidMethodSpy).toHaveBeenCalledWith(httpRequest.body.email)
  })

  it('should return status code 500 if EmailValidator throws an error', () => {
    const { sut, emailValidatorStub } = makeSut()
    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
      throw new Error()
    })
    const httpRequest = {
      body: {
        name: 'name',
        email: 'email@example.com',
        password: 'password',
        passwordConfirmation: 'password'
      }
    }
    const httpResponse = sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  it('should ensure that CreateUserAccount is being called with the provided user data', () => {
    const { sut, createUserAccountStub } = makeSut()
    const executeMethodSpy = jest.spyOn(createUserAccountStub, 'execute')
    const userAccountProps = {
      name: 'name',
      email: 'email@example.com',
      password: 'password',
      passwordConfirmation: 'password'
    }
    const httpRequest = {
      body: userAccountProps
    }
    sut.handle(httpRequest)
    expect(executeMethodSpy).toHaveBeenCalledWith({
      name: userAccountProps.name,
      email: userAccountProps.email,
      password: userAccountProps.password
    })
  })
})
