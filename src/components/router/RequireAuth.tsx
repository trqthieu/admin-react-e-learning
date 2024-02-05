import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@app/hooks/reduxHooks';
import { WithChildrenProps } from '@app/types/generalTypes';
import { doRetrieveUser } from '@app/store/slices/authSlice';

const RequireAuth: React.FC<WithChildrenProps> = ({ children }) => {
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  useEffect(() => {
    if (auth?.token && !auth?.user) {
      dispatch(doRetrieveUser());
    }
  }, [dispatch, auth?.token, auth?.user]);
  return auth?.token ? <>{children}</> : <Navigate to="/auth/login" replace />;
};

export default RequireAuth;
