export const validators = {
  name: (v) => (v.length < 20 || v.length > 60 ? 'Name must be 20-60 characters' : ''),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Invalid email'),
  address: (v) => (!v || v.length > 400 ? 'Address required, max 400 characters' : ''),
  password: (v) =>
    v.length < 8 || v.length > 16 ? 'Password must be 8-16 characters'
    : !/[A-Z]/.test(v) ? 'Needs an uppercase letter'
    : !/[^A-Za-z0-9]/.test(v) ? 'Needs a special character' : '',
};

// returns { field: message } for non-empty errors
export const validate = (values, fields) =>
  Object.fromEntries(
    fields.map((f) => [f, validators[f === 'newPassword' ? 'password' : f](values[f] || '')]).filter(([, m]) => m));