export interface PasswordValidator {
  isValid (password: string): boolean
  confirmationIsMatching (password: string, passwordConfirmation: string): boolean
}
