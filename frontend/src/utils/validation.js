  // Constants for validation
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const PHONE_REGEX = /^[0-9]{10,13}$/;
  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Validasi Email
  export const validateEmail = (email) => {
    if (!EMAIL_REGEX.test(email)) {
      return "Email Tidak Valid.";
    }
    return null;
  };
  
  // Validasi Password
  export const validatePassword = (password) => {
    if (!PASSWORD_REGEX.test(password) || !password || password.length < 8) {
      return "Password Minimal 8 Karakter Dengan Huruf Besar, Kecil, Angka, Simbol.";
    }
    return null;
  };
  
  // Validasi Role
  export const validateRole = (selectedRole) => {
    if (!selectedRole) {
      return "Pilih Satu Role.";
    }
    return null;
  };

  // Validasi Phone
  export const validatePhone = (phone) => {
    if (!PHONE_REGEX.test(phone)) {
      return "No Whatsapp Tidak valid (10-13 digit).";
    }
    return null;
  };

  // Validasi Field Umum
  export const validateField = (value, type) => {
    // Periksa apakah field kosong
    if (!value) {
        return `${type} Tidak Boleh Kosong.`;
    }

    // Validasi khusus berdasarkan tipe
    switch (type) {
        case "email":
            return validateEmail(value);
        case "password":
            return validatePassword(value);
        case "role":
            return validateRole(value);
        case "phone":
            return validatePhone(value);
        default:
        return null;
    }

    return null;
  };
  
  // Validasi Objek Form
  export const validateFormFields = (fields) => {
    const errors = {};
  
    for (const [field, { value, type }] of Object.entries(fields)) {
      const error = validateField(value, type);
      if (error) {
        errors[field] = error;
      }
    }
  
    return errors;
  };
  