import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { toast } from 'react-toastify';
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg';
import Spinner from '../components/Spinner';

function ForgotPassword() {
	const [email, setEmail] = useState('');

	const handleChange = (e) => {
		setEmail(e.target.value);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const auth = getAuth();
			await sendPasswordResetEmail(auth, email);
			toast.success('Check your inbox for password reset!');
		} catch (err) {
			console.log(err);
			toast.error('Could not send reset email!');
		}
	};

	return (
		<div className='pageContainer'>
			<header>
				<p className='pageHeader'>Forgot Password</p>
				<Spinner />
			</header>
			<main>
				<form onSubmit={handleSubmit}>
					<input
						type='email'
						className='emailInput'
						placeholder='Email'
						id='email'
						value={email}
						onChange={handleChange}
					/>
					<Link to='/sign-in' className='forgotPasswordLink'>
						Sign In
					</Link>

					<div className='signInBar'>
						<div className='signInText'>Send Reset Link</div>
						<button className='signInButton'>
							<ArrowRightIcon fill='#fff' width='34px' height='34px' />
						</button>
					</div>
				</form>
			</main>
		</div>
	);
}

export default ForgotPassword;
