import React, { useState, useEffect } from 'react';

import { getAuth, updateProfile } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';

import {
	doc,
	updateDoc,
	collection,
	getDocs,
	query,
	where,
	orderBy,
	deleteDoc,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';

import arrowRight from '../assets/svg/keyboardArrowRightIcon.svg';
import homeIcon from '../assets/svg/homeIcon.svg';

import ListingItem from '../components/ListingItem';

function Profile() {
	const auth = getAuth();
	const [listings, setListings] = useState(null);
	const [loading, setLoading] = useState(true);
	const [changeDetails, setChangeDetails] = useState(false);
	const [formData, setFormData] = useState({
		name: auth.currentUser.displayName,
		email: auth.currentUser.email,
	});

	const { name, email } = formData;

	useEffect(() => {
		const fetchUserListings = async () => {
			const listingsRef = collection(db, 'listings');
			const q = query(
				listingsRef,
				where('userRef', '==', auth.currentUser.uid),
				orderBy('timestamp', 'desc')
			);

			const querySnap = await getDocs(q);
			let listings = [];

			querySnap.forEach((doc) => {
				return listings.push({
					id: doc.id,
					data: doc.data(),
				});
			});

			setListings(listings);
			setLoading(false);
		};

		fetchUserListings();
	}, [auth.currentUser.uid]);

	const navigate = useNavigate();

	const handleLogout = () => {
		auth.signOut();
		navigate('/');
	};

	const handleSubmit = async () => {
		try {
			if (auth.currentUser.displayName !== name) {
				// Update display name in firebase
				await updateProfile(auth.currentUser, {
					displayName: name,
				});

				// Update in firestore
				const userRef = doc(db, 'users', auth.currentUser.uid);
				await updateDoc(userRef, {
					name: name,
				});
			}
		} catch (err) {
			toast.error('Could not update profile details!');
		}
	};

	const handleChange = (e) => {
		setFormData((prevState) => ({
			...prevState,
			[e.target.id]: e.target.value,
		}));
	};

	const handleDelete = async (listingId) => {
		if (window.confirm('Are you sure you want to delete?')) {
			try {
				await deleteDoc(doc(db, 'listings', listingId));
				const updatedListings = listings.filter(
					(listing) => listing.id !== listingId
				);
				setListings(updatedListings);
				toast.success('Listing deleted successfully!');
			} catch (err) {
				console.log(err);
				toast.error('Something went wrong!');
			}
		}
	};

	const handleEdit = (listingId) => {
		navigate(`/edit-listing/${listingId}`);
	};

	return (
		<div className='profile'>
			<header className='profileHeader'>
				<p className='pageHeader'>My Profile</p>
				<button className='logOut' type='button' onClick={handleLogout}>
					Logout
				</button>
			</header>
			<main>
				<div className='profileDetailsHeader'>
					<p className='profileDetailsText'>Personal Details</p>
					<p
						className='changePersonalDetails'
						onClick={() => {
							changeDetails && handleSubmit();
							setChangeDetails((prevState) => !prevState);
						}}
					>
						{changeDetails ? 'done' : 'change'}
					</p>
				</div>

				<div className='profileCard'>
					<form>
						<input
							type='text'
							id='name'
							className={!changeDetails ? 'profileName' : 'profileNameActive'}
							disabled={!changeDetails}
							value={name}
							onChange={handleChange}
						/>
						<input
							type='email'
							id='name'
							className='profileEmail'
							disabled={true}
							value={email}
						/>
					</form>
				</div>

				<Link to='/create-listing' className='createListing'>
					<img src={homeIcon} alt='home' />
					<p>Sell or rent your home</p>
					<img src={arrowRight} alt='arrow right' />
				</Link>

				{!loading && listings?.length > 0 && (
					<>
						<p className='listingText'>Your Listings</p>
						<ul className='listingsList'>
							{listings.map((listing) => (
								<ListingItem
									key={listing.id}
									listing={listing.data}
									id={listing.id}
									onDelete={() => handleDelete(listing.id)}
									onEdit={() => handleEdit(listing.id)}
								/>
							))}
						</ul>
					</>
				)}
			</main>
		</div>
	);
}

export default Profile;
