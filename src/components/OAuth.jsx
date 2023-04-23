import React from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { toast } from 'react-toastify';
import googleIcon from '../assets/svg/googleIcon.svg';
import { db } from '../firebase.config';

function OAuth() {
	const navigate = useNavigate();
	const location = useLocation();

	const handleGoogleClick = async () => {
		try {
			const auth = getAuth();
			const provider = new GoogleAuthProvider();
			const result = await signInWithPopup(auth, provider);
			const user = result.user;

			// Check if user already exists or not. If not, insert into firebase
			const docRef = doc(db, 'users', user.uid);
			const docSnap = await getDoc(docRef);

			if (!docSnap.exists()) {
				await setDoc(doc(db, 'users', user.uid), {
					name: user.displayName,
					email: user.email,
					timestamp: serverTimestamp(),
				});
			}

			toast.success('Logged in successfully!');

			navigate('/');
		} catch (err) {
			console.log(err);
			toast.error('Could not authorize with Google!');
		}
	};

	return (
		<div className='socialLogin'>
			<p>Sign {location.pathname === '/sign-up' ? 'up' : 'in'} with </p>
			<button className='socialIconDiv' onClick={handleGoogleClick}>
				<img src={googleIcon} alt='Google icon' className='socialIconImg' />
			</button>
		</div>
	);
}

export default OAuth;
