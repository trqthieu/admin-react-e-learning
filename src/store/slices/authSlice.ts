import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  ResetPasswordRequest,
  login,
  LoginRequest,
  signUp,
  SignUpRequest,
  resetPassword,
  verifySecurityCode,
  SecurityCodePayload,
  NewPasswordData,
  setNewPassword,
  getMe,
} from '@app/api/auth.api';
import { setUser } from '@app/store/slices/userSlice';
import { deleteToken, deleteUser, persistToken, readToken } from '@app/services/localStorage.service';
import { UserResponse } from '@app/api/users.api';

export interface AuthSlice {
  token: string | null;
  user: UserResponse | null;
}

const initialState: AuthSlice = {
  token: readToken(),
  user: null,
};

export const doLogin = createAsyncThunk('auth/doLogin', async (loginPayload: LoginRequest, { dispatch }) => {
  console.log('loginPayload', loginPayload);

  const loginResponse = await login(loginPayload);
  persistToken(loginResponse.access_token);
  const myInfo = await getMe();
  console.log('myInfo', myInfo);

  return {
    access_token: loginResponse.access_token,
    user: {
      ...myInfo,
    },
  };
});

export const doRetrieveUser = createAsyncThunk('auth/retrieveUser', async (_, { rejectWithValue }) => {
  const myInfo = await getMe();
  return myInfo;
});

export const doSignUp = createAsyncThunk('auth/doSignUp', async (signUpPayload: SignUpRequest) =>
  signUp(signUpPayload),
);

export const doResetPassword = createAsyncThunk(
  'auth/doResetPassword',
  async (resetPassPayload: ResetPasswordRequest) => resetPassword(resetPassPayload),
);

export const doVerifySecurityCode = createAsyncThunk(
  'auth/doVerifySecurityCode',
  async (securityCodePayload: SecurityCodePayload) => verifySecurityCode(securityCodePayload),
);

export const doSetNewPassword = createAsyncThunk('auth/doSetNewPassword', async (newPasswordData: NewPasswordData) =>
  setNewPassword(newPasswordData),
);

export const doLogout = createAsyncThunk('auth/doLogout', (payload, { dispatch }) => {
  deleteToken();
  deleteUser();
  dispatch(setUser(null));
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(doLogin.fulfilled, (state, action) => {
      state.token = action.payload.access_token;
      state.user = action.payload.user;
    });
    builder.addCase(doRetrieveUser.fulfilled, (state, action) => {
      state.user = action.payload;
    });
    builder.addCase(doLogout.fulfilled, (state) => {
      state.token = '';
      state.user = null;
    });
  },
});

export default authSlice.reducer;
