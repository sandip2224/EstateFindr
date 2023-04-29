import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import { sendEmail } from '../utils/sendMail';
import { getAuth } from 'firebase/auth';

function Contact() {
	const [message, setMessage] = useState('');
	const [landlord, setLandlord] = useState(null);
	const [loading, setLoading] = useState(true);
	// eslint-disable-next-line
	const [searchParams, setSearchParams] = useSearchParams();

	const params = useParams();
	const auth = getAuth();

	const handleChange = (e) => {
		setMessage(e.target.value);
	};

	useEffect(() => {
		const getLandlord = async () => {
			const docRef = doc(db, 'users', params.landlordId);
			const docSnap = await getDoc(docRef);

			if (docSnap.exists()) {
				setLandlord(docSnap.data());
				setLoading(false);
			} else {
				toast.error('Could not fetch landlord data!');
				setLoading(false);
			}
		};
		getLandlord();
	}, [params.landlordId]);

	if (loading) {
		return <Spinner />;
	}
	return (
		<div className='pageContainer'>
			<header>
				<p className='pageHeader'>Contact Landlord</p>
			</header>

			{landlord !== null && (
				<main>
					<div className='contactLandlord'>
						<p className='landlordName'>Contact {landlord?.name}</p>
					</div>

					<form className='messageForm'>
						<div className='messageDiv'>
							<label className='messageLabel'>Message</label>
							<textarea
								name='message'
								id='message'
								className='textarea'
								value={message}
								onChange={handleChange}
							></textarea>
						</div>

						<button
							className='primaryButton'
							onClick={(e) => {
								e.preventDefault();
								sendEmail(
									message,
									landlord,
									searchParams.get('listingName'),
									auth?.currentUser?.displayName
								);
								toast.info('Sending message...');
							}}
						>
							Send message
						</button>
					</form>
				</main>
			)}
		</div>
	);
}

export default Contact;
