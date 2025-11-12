export interface ValidationResult {
  isValid: boolean;
  message: string;
  normalized?: string; // for email
  strength?: string;   // for password
}

/**
 * Validates username format and rules
 */
export function validateUsername(username: string): ValidationResult {
  if (!username) return { isValid: true, message: "" }; // optional

  const usernameStr = username.trim(); // remove leading/trailing spaces

  if (usernameStr.length < 3)
    return { isValid: false, message: "Username must be at least 3 characters long" };
  if (usernameStr.length > 20)
    return { isValid: false, message: "Username must be no more than 20 characters long" };

  // regex now allows letters, numbers, underscores, and spaces
  const usernameRegex = /^[a-zA-Z0-9_ ]+$/;
  if (!usernameRegex.test(usernameStr))
    return { isValid: false, message: "Username can only contain letters, numbers, spaces, and underscores" };

  if (usernameStr.startsWith("_") || usernameStr.startsWith(" "))
    return { isValid: false, message: "Username cannot start with an underscore or space" };
  if (usernameStr.endsWith("_") || usernameStr.endsWith(" "))
    return { isValid: false, message: "Username cannot end with an underscore or space" };
  if (usernameStr.includes("__"))
    return { isValid: false, message: "Username cannot contain consecutive underscores" };
  if (usernameStr.includes("  "))
    return { isValid: false, message: "Username cannot contain consecutive spaces" };

  return { isValid: true, message: "" };
}


/**
 * Validates email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) return { isValid: false, message: "Email is required", normalized: "" };

  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

  if (!emailRegex.test(normalizedEmail))
    return { isValid: false, message: "Invalid email format", normalized: "" };

  return { isValid: true, message: "", normalized: normalizedEmail };
}

/**
 * Validates phone number format
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone) return { isValid: true, message: "" }; // optional

  const cleanPhone = phone.replace(/[\s\-\(\)\+]/g, "");
  if (!/^\d+$/.test(cleanPhone)) return { isValid: false, message: "Phone number can only contain digits" };
  if (cleanPhone.length < 7 || cleanPhone.length > 15)
    return { isValid: false, message: "Phone number must be between 7 and 15 digits" };

  return { isValid: true, message: "" };
}

/**
 * Validates bio length
 */
export function validateBio(bio: string): ValidationResult {
  if (!bio) return { isValid: true, message: "" }; // optional
  if (bio.trim().length > 500) return { isValid: false, message: "Bio must be no more than 500 characters" };
  return { isValid: true, message: "" };
}

/**
 * Validates password strength
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, message: "Password is required", strength: "weak" };
  }

  const pwd = password.trim();

  if (pwd.length < 8)
    return { isValid: false, message: "Password must be at least 8 characters", strength: "weak" };

  if (pwd.length > 128)
    return { isValid: false, message: "Password must be less than 128 characters", strength: "weak" };

  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /\d/.test(pwd);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd);

  if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
    return { isValid: false, message: "Password must contain upper, lower, number & special char", strength: "weak" };
  }

  let score = 0;
  if (pwd.length >= 12) score += 2;
  else if (pwd.length >= 10) score += 1;

  if (hasUpper && hasLower) score++;
  if (hasNumber) score++;
  if (hasSpecial) score++;
  if (pwd.length >= 16) score++;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{2,}/.test(pwd)) score++;

  const strength = score >= 6 ? "strong" : score >= 4 ? "medium" : "weak";

  return { isValid: true, message: "", strength };
}


export function validateSocialLink(value: string) {
  if (!value.trim()) {
    return { isValid: true }; // empty links are allowed until user adds
  }

  // Basic URL pattern (accepts http, https, www)
  const regex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-]*)*\/?$/;
  const isValid = regex.test(value.trim());
  return { isValid, message: isValid ? "" : "Invalid social link URL" };
}

