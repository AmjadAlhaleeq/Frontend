/**
 * Test accounts for the application
 * These accounts can be used for testing different user roles and functionalities
 */

export const TEST_ACCOUNTS = {
  // Admin account (based on provided details)
  admin: {
    id: "admin1",
    email: "osamaabbadi123456@gmail.com",
    firstName: "Osama",
    lastName: "Abbadi",
    age: 22,
    city: "Amman",
    position: "Forward",
    phone: "07997444269",
    password: "osamaosama",
    role: "admin",
    avatarUrl: "https://i.pravatar.cc/300?u=admin1",
  },

  // Player account
  player: {
    id: "player1",
    email: "testplayer@example.com",
    firstName: "Test",
    lastName: "Player",
    age: 25,
    city: "Amman",
    position: "Midfielder",
    phone: "0799123456",
    password: "testplayer",
    role: "player",
    avatarUrl: "https://i.pravatar.cc/300?u=player1",
  },
};

/**
 * Login with a test account
 * @param {string} accountType - Type of account ('admin' or 'player')
 * @returns {boolean} - Whether login was successful
 */
export const loginWithTestAccount = (
  accountType: "admin" | "player"
): boolean => {
  try {
    const account = TEST_ACCOUNTS[accountType];

    // Store user data in localStorage
    localStorage.setItem(
      "currentUser",
      JSON.stringify({
        id: account.id,
        email: account.email,
        firstName: account.firstName,
        lastName: account.lastName,
        avatarUrl: account.avatarUrl,
        age: account.age,
        city: account.city,
        favoritePosition: account.position,
        phoneNumber: account.phone,
      })
    );

    // Set user role
    localStorage.setItem("userRole", account.role);
    localStorage.setItem("isLoggedIn", "true");

    // Set first time login flag
    localStorage.setItem("firstTimeLogin", "true");

    // Initialize registered users array if it doesn't exist
    if (!localStorage.getItem("registeredUsers")) {
      localStorage.setItem("registeredUsers", JSON.stringify([]));
    }

    // Dispatch login event
    window.dispatchEvent(new Event("loginStatusChanged"));

    return true;
  } catch (error) {
    console.error("Error logging in with test account:", error);
    return false;
  }
};
