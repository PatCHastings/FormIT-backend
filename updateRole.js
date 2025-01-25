const { User } = require('./models'); // Adjust the path to your User model

const changeRoleToAdmin = async (email) => {
  try {
    // Find the user by email
    const user = await User.findOne({ where: { email } });

    if (!user) {
      console.error(`User with email "${email}" not found.`);
      return;
    }

    // Check if the user is already an admin
    if (user.role === 'admin') {
      console.log(`User with email "${email}" is already an admin.`);
      return;
    }

    // Update the role to admin
    user.role = 'admin';
    await user.save();

    console.log(`Role of user with email "${email}" has been successfully updated to admin.`);
  } catch (error) {
    console.error('Error updating user role:', error);
  }
};

// email of the user to be updated
const clientEmail = 'phastings82@gmail.com';

changeRoleToAdmin(clientEmail);
