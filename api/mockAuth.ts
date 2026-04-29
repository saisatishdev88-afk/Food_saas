export const mockLogin = async (username: string) => {
  return new Promise<{ user: any, role: string, token: string }>((resolve, reject) => {
    setTimeout(() => {
      let role = 'customer';
      if (username.startsWith('super')) role = 'superadmin';
      else if (username.startsWith('admin')) role = 'admin';
      else if (username.startsWith('cashier')) role = 'cashier';
      else if (username.startsWith('kitchen')) role = 'kitchen';
      else if (username.startsWith('delivery')) role = 'delivery';

      if (username.length > 3) {
        resolve({
          user: { id: 1, name: username },
          role,
          token: `mock-token-${role}-${Date.now()}`
        });
      } else {
        reject(new Error('Invalid credentials'));
      }
    }, 500);
  });
};
