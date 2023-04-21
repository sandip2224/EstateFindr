import React, { useEffect, useState } from 'react';

import { getAuth } from 'firebase/auth';

function Profile() {
	const [user, setUser] = useState(null);
	const auth = getAuth();
	useEffect(() => {
		setUser(auth.currentUser);
	}, []);

	return user ? <h1>Hello {user.displayName}</h1> : <h1>'Not logged in!'</h1>;
}

export default Profile;
