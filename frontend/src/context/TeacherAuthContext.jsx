import { createContext, useContext, useEffect, useState } from 'react';
import { teacherAuthAPI, TEACHER_TOKEN_KEY, TEACHER_USER_KEY } from '../services/teacherApi';

const TeacherAuthContext = createContext(null);

export function TeacherAuthProvider({ children }) {
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TEACHER_TOKEN_KEY);
    const saved = localStorage.getItem(TEACHER_USER_KEY);
    if (token && saved) {
      setTeacher(JSON.parse(saved));
      teacherAuthAPI.getMe().catch(() => logout());
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = (data) => {
    localStorage.setItem(TEACHER_TOKEN_KEY, data.token);
    const teacherData = { _id: data._id, name: data.name, email: data.email, department: data.department };
    localStorage.setItem(TEACHER_USER_KEY, JSON.stringify(teacherData));
    setTeacher(teacherData);
    return data;
  };

  const login = async (email, password) => {
    const { data } = await teacherAuthAPI.login({ email, password });
    return persist(data);
  };

  const register = async (payload) => {
    const { data } = await teacherAuthAPI.register(payload);
    return persist(data);
  };

  const updateProfile = async (payload) => {
    const { data } = await teacherAuthAPI.updateProfile(payload);
    const teacherData = { ...teacher, ...data };
    localStorage.setItem(TEACHER_USER_KEY, JSON.stringify(teacherData));
    setTeacher(teacherData);
    return data;
  };

  const logout = () => {
    localStorage.removeItem(TEACHER_TOKEN_KEY);
    localStorage.removeItem(TEACHER_USER_KEY);
    setTeacher(null);
  };

  return (
    <TeacherAuthContext.Provider value={{ teacher, loading, login, register, updateProfile, logout }}>
      {children}
    </TeacherAuthContext.Provider>
  );
}

export const useTeacherAuth = () => {
  const context = useContext(TeacherAuthContext);
  if (!context) throw new Error('useTeacherAuth must be used within TeacherAuthProvider');
  return context;
};
