import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
	collection,
	getDocs,
	query,
	where,
	orderBy,
	limit,
	startAfter,
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { toast } from 'react-toastify';
import Spinner from '../components/Spinner';
import ListingItem from '../components/ListingItem';

function Category() {
	const [listings, setListings] = useState(null);
	const [loading, setLoading] = useState(false);
	const [lastFetchedListing, setLastFetchedListing] = useState(null);

	const params = useParams();

	useEffect(() => {
		setLoading(true);
		const fetchListings = async () => {
			try {
				// Get a reference
				const listingsRef = collection(db, 'listings');

				// Create a query
				const q = query(
					listingsRef,
					where('type', '==', params.categoryName),
					orderBy('timestamp', 'desc'),
					limit(5)
				);

				// Execute query
				const querySnap = await getDocs(q);
				const lastVisible = querySnap.docs[querySnap.docs.length - 1];
				setLastFetchedListing(lastVisible);

				const listings = [];
				querySnap.forEach((doc) => {
					return listings.push({
						id: doc.id,
						data: doc.data(),
					});
				});

				setListings(listings);
				setLoading(false);
			} catch (err) {
				toast.error('Could not fetch listings!');
				setLoading(false);
			}
		};

		fetchListings();
		// eslint-disable-next-line
	}, []);

	// Pagination / load more
	const onFetchMoreListings = async () => {
		try {
			// Get a reference
			const listingsRef = collection(db, 'listings');

			// Create a query
			const q = query(
				listingsRef,
				where('type', '==', params.categoryName),
				orderBy('timestamp', 'desc'),
				startAfter(lastFetchedListing),
				limit(5)
			);

			// Execute query
			const querySnap = await getDocs(q);
			const lastVisible = querySnap.docs[querySnap.docs.length - 1];
			setLastFetchedListing(lastVisible);

			const listings = [];
			querySnap.forEach((doc) => {
				return listings.push({
					id: doc.id,
					data: doc.data(),
				});
			});

			setListings((prevState) => [...prevState, ...listings]);
			setLoading(false);
		} catch (err) {
			toast.error('Could not fetch listings!');
			setLoading(false);
		}
	};

	return (
		<div className='category'>
			<header>
				<p className='pageHeader'>
					{params.categoryName === 'rent'
						? 'Places for rent'
						: 'Places for sale'}
				</p>
			</header>

			{loading ? (
				<Spinner />
			) : listings && listings.length > 0 ? (
				<>
					<main>
						<ul className='categoryListings'>
							{listings.map((listing) => {
								return (
									<ListingItem
										listing={listing.data}
										id={listing.id}
										key={listing.id}
									/>
								);
							})}
						</ul>
					</main>

					<br />
					<br />

					{lastFetchedListing && (
						<p className='loadMore' onClick={onFetchMoreListings}>
							Load More
						</p>
					)}
				</>
			) : (
				<p>No listings for {params.categoryName}</p>
			)}
		</div>
	);
}

export default Category;
