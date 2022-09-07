export interface PasswordValidator {
  confirmationIsMatching (password: string, passwordConfirmation: string): boolean
}
