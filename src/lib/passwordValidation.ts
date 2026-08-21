const MIN_PASSWORD_LENGTH = 8;

export function validatePasswordStrength(
  password: string
): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return "Password must be at least 8 characters long.";
  }

  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter.";
  }

  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter.";
  }

  if (!/\d/.test(password)) {
    return "Password must contain at least one number.";
  }

  return null;
}

export function isStrongPassword(
  password: string
): boolean {
  return validatePasswordStrength(password) === null;
}

export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  lowercase: true,
  uppercase: true,
  number: true,
};
