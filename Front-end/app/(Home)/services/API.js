

// ✅ bật/tắt mock dễ dàng
const USE_MOCK = true;

// Quản lý authentication
export const loginUser = async (email, password) => {
  const user = mockUsers.find(u => u.email === email && u.password === password);
  if (user) {
    // Lưu thông tin user vào localStorage
    localStorage.setItem('currentUser', JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.name
    }));
    return { success: true, user };
  }
  return { success: false, message: "Email hoặc mật khẩu không chính xác" };
};

export const registerUser = async (email, password, name) => {
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    return { success: false, message: "Email đã tồn tại" };
  }
  
  const newUser = {
    id: mockUsers.length + 1,
    email,
    password,
    name
  };
  mockUsers.push(newUser);
  return { success: true, user: newUser };
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

export const logout = () => {
  localStorage.removeItem('currentUser');
};
