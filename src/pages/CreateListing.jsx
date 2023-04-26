import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import {
	getStorage,
	ref,
	uploadBytesResumable,
	getDownloadURL,
} from 'firebase/storage';

import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

import { db } from '../firebase.config';

import { useNavigate } from 'react-router-dom';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

function CreateListing() {
	const [geolocationEnabled, setGeolocationEnabled] = useState(true);
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		type: 'rent',
		name: '',
		bedrooms: 1,
		bathrooms: 1,
		parking: false,
		furnished: false,
		address: '',
		offer: false,
		regularPrice: 0,
		discountedPrice: 0,
		images: {},
		latitude: 0,
		longitude: 0,
	});

	const auth = getAuth();
	const navigate = useNavigate();
	const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

	const {
		type,
		name,
		bedrooms,
		bathrooms,
		parking,
		furnished,
		address,
		offer,
		regularPrice,
		discountedPrice,
		images,
		latitude,
		longitude,
	} = formData;

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		if (discountedPrice >= regularPrice) {
			setLoading(false);
			return toast.error(
				'Discounted price needs to be less than regular price!'
			);
		}
		if (images.length > 6) {
			setLoading(false);
			return toast.error('Maximum 6 images allowed!');
		}

		let geolocation = {};

		if (geolocationEnabled) {
			const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${address}.json?access_token=${MAPBOX_ACCESS_TOKEN}`;
			try {
				const response = await axios.get(url);
				const data = response.data;

				if (response.status === 404) {
					throw new Error('Please enter a correct location!');
				}

				geolocation.lat = data?.features[0]?.geometry.coordinates[1] ?? 0;
				geolocation.lng = data?.features[0]?.geometry.coordinates[0] ?? 0;
			} catch (error) {
				console.log(error);
				setLoading(false);
				if (typeof error === 'string') {
					return toast.error(error);
				} else {
					return toast.error('Something went wrong!');
				}
			}
		} else {
			geolocation.lat = latitude;
			geolocation.lng = longitude;
		}

		// Store images in firebase

		const storeImage = async (image) => {
			return new Promise((resolve, reject) => {
				const storage = getStorage();
				const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;

				const storageRef = ref(storage, 'images/' + fileName);

				const uploadTask = uploadBytesResumable(storageRef, image);

				uploadTask.on(
					'state_changed',
					(snapshot) => {
						const progress =
							(snapshot.bytesTransferred / snapshot.totalBytes) * 100;
						console.log('Upload is ' + progress + '% done');
						switch (snapshot.state) {
							case 'paused':
								console.log('Upload is paused');
								break;
							case 'running':
								console.log('Upload is running');
								break;
						}
					},
					(error) => {
						reject(error);
					},
					() => {
						getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
							resolve(downloadURL)
						);
					}
				);
			});
		};

		const imgUrls = await Promise.all(
			[...images].map((image) => storeImage(image))
		).catch(() => {
			setLoading(false);
			return toast.error('Images upload failed!');
		});

		const formDataCopy = {
			...formData,
			imgUrls,
			geolocation,
			timestamp: serverTimestamp(),
		};

		delete formDataCopy.images;
		!formDataCopy.offer && delete formDataCopy.discountedPrice;

		const docRef = await addDoc(collection(db, 'listings'), formDataCopy);

		setLoading(false);
		toast.success('Listing saved successfully!');
		navigate(`/category/${formDataCopy.type}/${docRef.id}`);
	};

	const onMutate = (e) => {
		let boolean = null;
		const val = e.target.value;

		if (val === 'true') {
			boolean = true;
		}
		if (val === 'false') {
			boolean = false;
		}

		// Files
		if (e.target.files) {
			setFormData((prevState) => ({
				...prevState,
				images: e.target.files,
			}));
		}
		// Text,numbers,boolean
		if (!e.target.files) {
			setFormData((prevState) => ({
				...prevState,
				[e.target.id]:
					val === null || val == ''
						? val
						: isNaN(val)
						? boolean ?? val
						: Number(val),
			}));
		}
	};

	useEffect(() => {
		// setLoading(true);
		onAuthStateChanged(auth, (user) => {
			if (user) {
				setFormData({ ...formData, userRef: user.uid });
			} else {
				navigate('/sign-in');
			}
		});
	}, []);

	if (loading) return <Spinner />;
	else
		return (
			<div className='profile'>
				<header>
					<p className='pageHeader'>Create a Listing</p>
				</header>
				<main>
					<form onSubmit={handleSubmit}>
						<label className='formLabel'>Sell / Rent</label>
						<div className='formButtons'>
							<button
								type='button'
								className={type === 'sale' ? 'formButtonActive' : 'formButton'}
								id='type'
								value='sale'
								onClick={onMutate}
							>
								Sell
							</button>
							<button
								type='button'
								className={type === 'rent' ? 'formButtonActive' : 'formButton'}
								id='type'
								value='rent'
								onClick={onMutate}
							>
								Rent
							</button>
						</div>

						<label className='formLabel'>Name</label>
						<input
							className='formInputName'
							type='text'
							id='name'
							value={name}
							onChange={onMutate}
							maxLength='32'
							minLength='10'
							required
						/>

						<div className='formRooms flex'>
							<div>
								<label className='formLabel'>Bedrooms</label>
								<input
									className='formInputSmall'
									type='number'
									id='bedrooms'
									value={bedrooms}
									onChange={onMutate}
									min='1'
									max='50'
									required
								/>
							</div>
							<div>
								<label className='formLabel'>Bathrooms</label>
								<input
									className='formInputSmall'
									type='number'
									id='bathrooms'
									value={bathrooms}
									onChange={onMutate}
									min='1'
									max='50'
									required
								/>
							</div>
						</div>

						<label className='formLabel'>Parking spot</label>
						<div className='formButtons'>
							<button
								className={parking ? 'formButtonActive' : 'formButton'}
								type='button'
								id='parking'
								value={true}
								onClick={onMutate}
								min='1'
								max='50'
							>
								Yes
							</button>
							<button
								className={
									!parking && parking !== null
										? 'formButtonActive'
										: 'formButton'
								}
								type='button'
								id='parking'
								value={false}
								onClick={onMutate}
							>
								No
							</button>
						</div>
						<label className='formLabel'>Furnished</label>
						<div className='formButtons'>
							<button
								className={furnished ? 'formButtonActive' : 'formButton'}
								type='button'
								id='furnished'
								value={true}
								onClick={onMutate}
							>
								Yes
							</button>
							<button
								className={
									!furnished && furnished !== null
										? 'formButtonActive'
										: 'formButton'
								}
								type='button'
								id='furnished'
								value={false}
								onClick={onMutate}
							>
								No
							</button>
						</div>
						<label className='formLabel'>Address</label>
						<textarea
							className='formInputAddress'
							type='text'
							id='address'
							value={address}
							onChange={onMutate}
							required
						/>

						{!geolocationEnabled && (
							<div className='formLatLng flex'>
								<div>
									<label className='formLabel'>Latitude</label>
									<input
										className='formInputSmall'
										type='number'
										id='latitude'
										value={latitude}
										onChange={onMutate}
										required
									/>
								</div>
								<div>
									<label className='formLabel'>Longitude</label>
									<input
										className='formInputSmall'
										type='number'
										id='longitude'
										value={longitude}
										onChange={onMutate}
										required
									/>
								</div>
							</div>
						)}

						<label className='formLabel'>Offer</label>
						<div className='formButtons'>
							<button
								className={offer ? 'formButtonActive' : 'formButton'}
								type='button'
								id='offer'
								value={true}
								onClick={onMutate}
							>
								Yes
							</button>
							<button
								className={
									!offer && offer !== null ? 'formButtonActive' : 'formButton'
								}
								type='button'
								id='offer'
								value={false}
								onClick={onMutate}
							>
								No
							</button>
						</div>

						<label className='formLabel'>Regular Price</label>
						<div className='formPriceDiv'>
							<input
								className='formInputSmall'
								type='number'
								id='regularPrice'
								value={regularPrice}
								onChange={onMutate}
								min='50'
								max='750000000'
								required
							/>
							{type === 'rent' && <p className='formPriceText'>$ / Month</p>}
						</div>

						{offer && (
							<>
								<label className='formLabel'>Discounted Price</label>
								<input
									className='formInputSmall'
									type='number'
									id='discountedPrice'
									value={discountedPrice}
									onChange={onMutate}
									min='50'
									max='750000000'
									required={offer}
								/>
							</>
						)}

						<label className='formLabel'>Images</label>
						<p className='imagesInfo'>
							The first image will be the cover (max 6).
						</p>
						<input
							className='formInputFile'
							type='file'
							id='images'
							onChange={onMutate}
							max='6'
							accept='.jpg,.png,.jpeg'
							multiple
							required
						/>
						<button type='submit' className='primaryButton createListingButton'>
							Create Listing
						</button>
					</form>
				</main>
			</div>
		);
}

export default CreateListing;
