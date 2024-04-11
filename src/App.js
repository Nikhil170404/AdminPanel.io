import React, { useState, useEffect } from 'react';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore'; // Import Firestore module
import './App.css'; // Import the CSS file

const firebaseConfig = {
  apiKey: "AIzaSyA1S8iHwDNl8qvl3ClLVBXpW3QNltrVIRg",
  authDomain: "findmybed-6f97a.firebaseapp.com",
  projectId: "findmybed-6f97a",
  storageBucket: "findmybed-6f97a.appspot.com",
  messagingSenderId: "521085721021",
  appId: "1:521085721021:web:7fb1796d69261b23d75ad4",
  measurementId: "G-5R33XF3D4W",
};

firebase.initializeApp(firebaseConfig);

const AdminPanel = ({ handleLogout }) => {
  const [hospitalData, setHospitalData] = useState([]);
  const [newHospitalName, setNewHospitalName] = useState('');
  const [newHospitalLocation, setNewHospitalLocation] = useState('');
  const [newWardName, setNewWardName] = useState('');
  const [newWardBeds, setNewWardBeds] = useState('');
  const [newWardVacantBeds, setNewWardVacantBeds] = useState('');
  const [updatingHospitalId, setUpdatingHospitalId] = useState(null);
  const [updatingWardIndex, setUpdatingWardIndex] = useState(null);
  const [editedHospitalName, setEditedHospitalName] = useState('');
  const [editedHospitalLocation, setEditedHospitalLocation] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const unsubscribe = firebase.firestore().collection('hospitals').onSnapshot(snapshot => {
          const hospitals = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setHospitalData(hospitals);
        });
        
        // Unsubscribe from the listener when component unmounts
        return () => unsubscribe();
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchData();
  }, []);

  const addHospital = async () => {
    try {
      await firebase.firestore().collection('hospitals').add({
        name: newHospitalName,
        location: newHospitalLocation,
        wards: []
      });
      setNewHospitalName('');
      setNewHospitalLocation('');
    } catch (error) {
      console.error(error.message);
    }
  };

  const addWard = async (hospitalId) => {
    try {
      const newWard = {
        name: newWardName,
        beds: parseInt(newWardBeds),
        vacantBeds: parseInt(newWardVacantBeds)
      };
      await firebase.firestore().collection('hospitals').doc(hospitalId).update({
        wards: firebase.firestore.FieldValue.arrayUnion(newWard)
      });
      setNewWardName('');
      setNewWardBeds('');
      setNewWardVacantBeds('');
    } catch (error) {
      console.error(error.message);
    }
  };

  const editWard = async (hospitalId, wardIndex, updatedWard) => {
    try {
      const hospitalRef = firebase.firestore().collection('hospitals').doc(hospitalId);
      const hospitalData = await hospitalRef.get();
      const wards = hospitalData.data().wards;
      wards[wardIndex] = updatedWard;
      await hospitalRef.update({ wards });
    } catch (error) {
      console.error(error.message);
    }
  };

  const deleteWard = async (hospitalId, wardIndex) => {
    try {
      const hospitalRef = firebase.firestore().collection('hospitals').doc(hospitalId);
      const hospitalData = await hospitalRef.get();
      const wards = hospitalData.data().wards;
      wards.splice(wardIndex, 1);
      await hospitalRef.update({ wards });
    } catch (error) {
      console.error(error.message);
    }
  };

  const deleteHospital = async (hospitalId) => {
    try {
      await firebase.firestore().collection('hospitals').doc(hospitalId).delete();
      const updatedHospitals = hospitalData.filter(hospital => hospital.id !== hospitalId);
      setHospitalData(updatedHospitals);
    } catch (error) {
      console.error(error.message);
    }
  };

  const updateEditedHospital = async (hospitalId) => {
    try {
      await firebase.firestore().collection('hospitals').doc(hospitalId).update({
        name: editedHospitalName,
        location: editedHospitalLocation
      });
      setEditedHospitalName('');
      setEditedHospitalLocation('');
      setUpdatingHospitalId(null);
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>
      <button onClick={handleLogout}>Logout</button>
      
      {/* Hospital form for adding new hospitals */}
      <div>
        <h2>Add New Hospital</h2>
        <input 
          type="text" 
          value={newHospitalName} 
          onChange={(e) => setNewHospitalName(e.target.value)} 
          placeholder="Hospital Name" 
        />
        <input 
          type="text" 
          value={newHospitalLocation} 
          onChange={(e) => setNewHospitalLocation(e.target.value)} 
          placeholder="Hospital Location" 
        />
        <button onClick={addHospital}>Add Hospital</button>
      </div>

      {/* Form for adding a new ward */}
      {updatingHospitalId && (
        <div>
          <h2>Add New Ward</h2>
          <input 
            type="text" 
            value={newWardName} 
            onChange={(e) => setNewWardName(e.target.value)} 
            placeholder="Ward Name" 
          />
          <input 
            type="number" 
            value={newWardBeds} 
            onChange={(e) => setNewWardBeds(e.target.value)} 
            placeholder="Total Beds" 
          />
          <input 
            type="number" 
            value={newWardVacantBeds} 
            onChange={(e) => setNewWardVacantBeds(e.target.value)} 
            placeholder="Vacant Beds" 
          />
          <button onClick={() => addWard(updatingHospitalId)}>Add Ward</button>
        </div>
      )}

      {/* List of existing hospitals as a table */}
      <h2>Hospitals</h2>
      <table>
        <thead>
          <tr>
            <th>Hospital Name</th>
            <th>Location</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {hospitalData.map(hospital => (
            <tr key={hospital.id}>
              <td onClick={() => {
                setUpdatingHospitalId(hospital.id);
                setEditedHospitalName(hospital.name);
                setEditedHospitalLocation(hospital.location);
              }}>
                {hospital.name}
              </td>
              <td>{hospital.location}</td>
              <td>
                <button onClick={() => setUpdatingHospitalId(hospital.id)}>Edit Hospital</button>
                <button onClick={() => deleteHospital(hospital.id)}>Delete Hospital</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Form for editing hospital */}
{updatingHospitalId && (
  <div>
    <h2>Edit Hospital</h2>
    {/* Set initial values for input fields */}
    <input 
      type="text" 
      value={editedHospitalName || (hospitalData.find(hospital => hospital.id === updatingHospitalId)?.name)} 
      onChange={(e) => setEditedHospitalName(e.target.value)} 
      placeholder="Hospital Name" 
    />
    <input 
      type="text" 
      value={editedHospitalLocation || (hospitalData.find(hospital => hospital.id === updatingHospitalId)?.location)} 
      onChange={(e) => setEditedHospitalLocation(e.target.value)} 
      placeholder="Hospital Location" 
    />
    <button onClick={() => updateEditedHospital(updatingHospitalId)}>Update Hospital</button>
  </div>
)}

      {/* List of wards for the selected hospital */}
      {updatingHospitalId && (
        <div>
          <h2>Wards</h2>
          <table>
            <thead>
              <tr>
                <th>Ward Name</th>
                <th>Total Beds</th>
                <th>Vacant Beds</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hospitalData.find(hospital => hospital.id === updatingHospitalId).wards.map((ward, index) => (
                <tr key={index}>
                  <td>{ward.name}</td>
                  <td>{ward.beds}</td>
                  <td>{ward.vacantBeds}</td>
                  <td>
                    <button onClick={() => setUpdatingWardIndex(index)}>Edit</button>
                    <button onClick={() => deleteWard(updatingHospitalId, index)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Form for editing a ward */}
      {updatingHospitalId && updatingWardIndex !== null && (
        <div>
          <h2>Edit Ward</h2>
          <input 
            type="text" 
            value={hospitalData.find(hospital => hospital.id === updatingHospitalId).wards[updatingWardIndex].name} 
            onChange={(e) => {
              const updatedWard = { ...hospitalData.find(hospital => hospital.id === updatingHospitalId).wards[updatingWardIndex], name: e.target.value };
              editWard(updatingHospitalId, updatingWardIndex, updatedWard);
            }} 
            placeholder="Ward Name" 
          />
          <input 
            type="number" 
            value={hospitalData.find(hospital => hospital.id === updatingHospitalId).wards[updatingWardIndex].beds} 
            onChange={(e) => {
              const updatedWard = { ...hospitalData.find(hospital => hospital.id === updatingHospitalId).wards[updatingWardIndex], beds: parseInt(e.target.value) };
              editWard(updatingHospitalId, updatingWardIndex, updatedWard);
            }} 
            placeholder="Total Beds" 
          />
          <input 
            type="number" 
            value={hospitalData.find(hospital => hospital.id === updatingHospitalId).wards[updatingWardIndex].vacantBeds} 
            onChange={(e) => {
              const updatedWard = { ...hospitalData.find(hospital => hospital.id === updatingHospitalId).wards[updatingWardIndex], vacantBeds: parseInt(e.target.value) };
              editWard(updatingHospitalId, updatingWardIndex, updatedWard);
            }} 
            placeholder="Vacant Beds" 
          />
          <button onClick={() => setUpdatingWardIndex(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

const SignIn = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if the user is already logged in
    const user = localStorage.getItem('user');
    if (user) {
      setUser(JSON.parse(user));
    }
  }, [setUser]);

  const handleSignIn = async () => {
    try {
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      setUser(user);
      // Store user data in local storage
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      setError(error.message);
    }
  };

  const handleSignInWithGoogle = async () => {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const userCredential = await firebase.auth().signInWithPopup(provider);
      const user = userCredential.user;
      setUser(user);
      // Store user data in local storage
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="sign-in">
      <h1>Sign In</h1>
      {error && <div>{error}</div>}
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <button onClick={handleSignIn}>Sign In</button>
      <button onClick={handleSignInWithGoogle}>Sign In with Google</button>
    </div>
  );
};

const Authentication = () => {
  const [user, setUser] = useState(null);

  return (
    <div className="container">
      {user ? (
        <AdminPanel handleLogout={() => {
          // Clear user data from local storage on logout
          localStorage.removeItem('user');
          setUser(null);
        }} />
      ) : (
        <SignIn setUser={setUser} />
      )}
    </div>
  );
};

export default Authentication;
