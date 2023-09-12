import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useAuthContext } from './auth.context';

export const BackendContext = createContext();

const BackendProvider = ({ children }) => {
  const { currentUser } = useAuthContext();
  const [allCatsLength, setAllCatsLength] = useState(0);
  const [getExploredCats, setGetExploredCats] = useState(() => {
    if (typeof window !== 'undefined' && currentUser && localStorage.getItem('exploredCats')) {
      const exploredCatsData = JSON.parse(localStorage.getItem('exploredCats'));
      return Object.values(exploredCatsData);
    } else {
      return [];
    }
  });

  useEffect(() => {
    const handleAllCatsLength = async () => setAllCatsLength(await getAllCatsLength());
    allCatsLength === 0 && handleAllCatsLength();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && currentUser && localStorage.getItem('exploredCats')) {
      const exploredCatsData = JSON.parse(localStorage.getItem('exploredCats'));
      setGetExploredCats(Object.values(exploredCatsData));
    } else {
      setGetExploredCats([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  //// BACKEND

  const resetBackend = async () => {
    await fetch(`http://localhost:8000/get_cat/?reset=${true}`);
  };

  const getAllCatsLength = async () => {
    const response = await fetch(`http://localhost:8000/get_cat/?get_length=${true}`);
    const data = await response.text();
    const length = parseInt(data);
    return length;
  };

  const updateBackend = async (exploredCatsforBackend) => {
    if (exploredCatsforBackend.length === 0) {
      await resetBackend();
    } else {
      const updateCatsIds = [];
      exploredCatsforBackend.map((breed) => {
        updateCatsIds.push(breed.id);
      });
      const queryUpdateCats = updateCatsIds.join(',');
      await fetch(`http://localhost:8000/get_cat/?update_cats=${queryUpdateCats}`);
    }
  };

  const fetchNewBreed = async (selected_index, selected_level, selected_action) => {
    try {
      const response = await fetch(
        `http://localhost:8000/get_cat/?selected_index=${selected_index}&selected_level=${selected_level}&selected_action=${selected_action}`
      );
      const newBreed = await response.json();
      return newBreed;
    } catch (error) {
      console.log(error);
    }
  };

  //// DATABASE

  const updateDataBaseBreeds = async (userUid, exploredCats) => {
    const docRef = doc(db, 'exploredCats', userUid);
    await setDoc(docRef, {
      ...exploredCats
    });
    localStorage.setItem('exploredCats', JSON.stringify(exploredCats));
  };

  const getDataBaseBreeds = async (userUid) => {
    const docRef = doc(db, 'exploredCats', userUid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setGetExploredCats(Object.values(docSnap.data()));
    } else {
      console.log(`Couldn't load exploredCats!`);
    }
    await updateBackend(getExploredCats);
  };

  //// COMPONENT
  return (
    <BackendContext.Provider
      value={{
        resetBackend,
        getAllCatsLength,
        updateBackend,
        fetchNewBreed,
        updateDataBaseBreeds,
        getDataBaseBreeds,
        allCatsLength,
        setAllCatsLength,
        getExploredCats
      }}>
      {children}
    </BackendContext.Provider>
  );
};

export const useBackendContext = () => {
  const context = useContext(BackendContext);
  if (context === undefined) {
    throw new Error('BackendContext must be used within a BackendProvider');
  }
  return context;
};

export default BackendProvider;