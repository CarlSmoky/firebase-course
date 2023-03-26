import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { useDocumentData } from 'react-firebase-hooks/firestore';
import { USERS, updateUser } from '../../firebase/index';
import firebase from '../../firebase/clientApp';

import { useUser } from '../components/user-context';
import LoadingError from '../components/LoadingError';
import Card from '../components/Card';
import ProfileForm from '../components/ProfileForm';

const Profile = () => {
  const { user } = useUser();
  const { uid } = useParams();

  const db = firebase.firestore();

  const [userDoc, loading, error] = useDocumentData(
    db.collection(USERS).doc(uid),
    {
      snapshotListenOptions: { includeMetadataChanges: true },
    }
  );

  // Check if current user is an admin
  const [adminMode, setAdminMode] = useState(false);

  const [isAdminProfile, setIsAdminProfile] = useState(false);

  useEffect(() => {
    if (user) {
      db.collection(USERS)
        .doc(user.uid)
        .get()
        .then((currentUser) => setAdminMode(currentUser.data().isAdmin));
    }
  }, []);

  useEffect(() => {
    if (userDoc) {
      setIsAdminProfile(userDoc.isAdmin);
    }
  }, [userDoc]);

  const handleSubmit = (event) => {
    event.preventDefault();
    return updateUser(userDoc.uid, { isAdmin: !isAdminProfile });
  };

  return (
    <main>
      <Card>
        <h1 className="text-2xl leading-6 font-medium text-gray-900">
          {`Edit ${userDoc?.uid === user.uid ? 'your' : 'user'} profile`}
        </h1>
      </Card>

      <LoadingError data={userDoc} loading={loading} error={error}>
        {userDoc && (
          <>
            <Card>
              <ProfileForm
                userDoc={userDoc}
                isCurrentUser={userDoc.uid === user.uid}
                adminMode={adminMode}
              />
            </Card>
          </>
        )}
      </LoadingError>

      <Card>
        <div className="sm:col-span-6">
          <label htmlFor="isAdmin" className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <p className="flex-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full min-w-0 rounded-md sm:text-sm border-gray-300">{userDoc && isAdminProfile ? 'Admin' : 'User'}</p>
          {userDoc && adminMode && !isAdminProfile && (
            <div className="pt- 5 flex justify-end">
              <button
                type="submit"
                className="ml-3 inline-flex   justify-center py-2 px-4 border   border-transparent shadow-sm  text-sm font-medium rounded-md   text-white bg-indigo-600  hover:bg-indigo-700  focus:outline-none focus:ring-2  focus:ring-offset-2  focus:ring-indigo-500"
                onClick={handleSubmit}
              >
                Grant Admin Access
              </button>
            </div>
          )
          }
        </div>
      </Card>
    </main>
  );
};

export default Profile;
