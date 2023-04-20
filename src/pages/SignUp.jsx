import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ReactComponent as ArrowRightIcon } from '../assets/svg/keyboardArrowRightIcon.svg';
import visibilityIcon from '../assets/svg/visibilityIcon.svg';

function SignUp() {
	const [showPassword, setShowPassword] = useState(false);
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});

	const { name, email, password } = showPassword;
	const navigate = useNavigate();

	const handleChange = (e) => {
		setFormData((prevState) => ({
			...prevState,
			[e.target.id]: e.target.value,
		}));
	};

	return (
		<>
			<div className='pageContainer'>
				<header>
					<p className='pageHeader'>Welcome Back!</p>
				</header>
				<main>
					<form>
						<input
							type='text'
							className='nameInput'
							placeholder='Name'
							id='name'
							value={name}
							onChange={handleChange}
						/>
						<input
							type='email'
							className='emailInput'
							placeholder='Email'
							id='email'
							value={email}
							onChange={handleChange}
						/>
						<div className='passwordInputDiv'>
							<input
								type={showPassword ? 'text' : 'password'}
								className='passwordInput'
								placeholder='Password'
								id='password'
								value={password}
								onChange={handleChange}
							/>
							<img
								src={visibilityIcon}
								alt='show password'
								className='showPassword'
								onClick={() => setShowPassword((prevState) => !prevState)}
							/>
						</div>
						<Link to='/forgot-password' className='forgotPasswordLink'>
							Forgot Password
						</Link>
						<div className='signInBar'>
							<p className='signInText'>Sign Up</p>
							<button className='signUpButton'>
								<ArrowRightIcon fill='#fff' width='34px' height='34px' />
							</button>
						</div>
					</form>

					{/* Google OAuth Component */}
					<Link to='/sign-in' className='registerLink'>
						Sign In Instead
					</Link>
				</main>
			</div>
		</>
	);
}

export default SignUp;
