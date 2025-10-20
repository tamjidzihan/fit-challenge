import React, { useEffect, useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, database, userService } from '../services/firebase';
import { AuthContext, type AuthContextType } from './AuthContext';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const register: AuthContextType['register'] = async (email, password, name) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: name });
        await userService.createUserProfile(user, { name });
        await set(ref(database, `users/${user.uid}`), {
            email,
            name,
            createdAt: new Date().toISOString()
        });

        return user;
    };

    const login: AuthContextType['login'] = async (email, password) => {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    };

    const logout: AuthContextType['logout'] = async () => {
        await signOut(auth);
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const value = { currentUser, loading, register, login, logout };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
