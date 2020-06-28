import { createAction, handleActions } from 'redux-actions';
import { combineReducers } from 'redux';
import request from '../../helpers/request';
import { openNotification } from '../notifications';
export const userProfileSelector = (state) => state.auth.userProfile;
export const userPermissionsSelector = (state) => state.auth.permissions;
export const tokensSelector = (state) => state.auth.tokens;
export const isAuthorizedSelector = (state) => !!state.auth.tokens.accessToken;
export const isLoadingUserProfileSelector = (state) => state.auth.isLoadingUserProfile;

const actionsPrefix = 'AUTH';
export const loginUserRequest = createAction(`${actionsPrefix}/LOGIN_USER_REQUEST`);
export const registrationUserRequest = createAction(
  `${actionsPrefix}/REGISTRATION_USER_REQUEST`
);
export const setProfileData = createAction(`${actionsPrefix}/SET_PROFILE_DATA`);
export const setTokenData = createAction(`${actionsPrefix}/SET_TOKEN_DATA`);
export const logoutUser = createAction(`${actionsPrefix}/LOGOUT_USER`);
export const setIsLoadingUserProfile = createAction(
  `${actionsPrefix}/SET_IS_LOADING_USER_PROFILE`
);

const isLoadingUserProfile = handleActions(
  {
    [setIsLoadingUserProfile]: (_, action) => action.payload,
  },
  false
);

const userProfile = handleActions(
  {
    [setProfileData]: (state, action) => {
      const { id, image, middleName, surName, username, firstName } = action.payload;
      return { id, image, firstName, middleName, surName, username };
    },
    [logoutUser]: () => null,
  },
  null
);
const defaultPermissions = {
  chat: { C: false, D: false, R: false, U: false },
  news: { C: false, D: false, R: false, U: false },
  settings: { C: false, D: false, R: false, U: false },
};
const permissions = handleActions(
  {
    [setProfileData]: (state, action) => {
      const { permission } = action.payload;
      return permission;
    },
    [logoutUser]: () => defaultPermissions,
  },
  defaultPermissions
);

const tokens = handleActions(
  {
    [setTokenData]: (state, action) => {
      const {
        accessToken,
        accessTokenExpiredAt,
        refreshToken,
        refreshTokenExpiredAt,
      } = action.payload;
      return {
        accessToken,
        accessTokenExpiredAt,
        refreshToken,
        refreshTokenExpiredAt,
      };
    },
    [logoutUser]: () => ({
      accessToken: null,
      accessTokenExpiredAt: null,
      refreshToken: null,
      refreshTokenExpiredAt: null,
    }),
  },
  {
    accessToken: null,
    accessTokenExpiredAt: null,
    refreshToken: null,
    refreshTokenExpiredAt: null,
  }
);

export default combineReducers({
  userProfile,
  permissions,
  tokens,
  isLoadingUserProfile,
});

export const loginUser = ({ username, password }) => (dispatch, getState) =>
  new Promise((resolve, reject) => {
    const data = {
      username,
      password,
    };
    request({
      url: '/login',
      method: 'POST',
      data,
      isWithoutToken: true,
      dispatch,
      getState,
    })
      .then((data) => {
        dispatch(openNotification({ text: 'Вы успешно вошли!', variant: 'success' }));
        const {
          accessToken,
          accessTokenExpiredAt,
          refreshToken,
          refreshTokenExpiredAt,
        } = data;
        localStorage.setItem(
          'token-data',
          JSON.stringify({
            accessToken,
            accessTokenExpiredAt,
            refreshToken,
            refreshTokenExpiredAt,
          })
        );
        dispatch(setProfileData(data));
        dispatch(setTokenData(data));
        resolve(data);
      })
      .catch((error) => {
        dispatch(
          openNotification({
            text: error.message,
            variant: 'error',
          })
        );
        reject(error);
      });
  });

export const registerUser = ({
  username,
  password,
  firstname,
  lastname,
  patronicname,
}) => (dispatch, getState) =>
  new Promise((resolve, reject) => {
    const data = {
      username,
      surName: lastname,
      firstName: firstname,
      middleName: patronicname,
      password,
    };
    request({
      url: '/registration',
      data,
      method: 'POST',
      isWithoutToken: true,
      dispatch,
      getState,
    })
      .then(() => {
        dispatch(
          openNotification({
            text: 'Вы успешно зарегистрированы!',
            variant: 'success',
          })
        );
        resolve(data);
      })
      .catch((error) => {
        dispatch(
          openNotification({
            text: error.message,
            variant: 'error',
          })
        );
        reject(error);
      });
  });

export const getUserProfileFromToken = () => (dispatch, getState) => {
  const tokenData = localStorage.getItem('token-data');
  if (!tokenData) return;
  dispatch(setTokenData(JSON.parse(tokenData)));
  request({ url: '/profile', method: 'GET', dispatch, getState })
    .then((data) => {
      dispatch(setProfileData(data));
    })
    .catch((error) => {});
};

export const refreshTokenRequest = () => (dispatch, getState) =>
  new Promise((resolve, reject) => {
    request({
      url: '/refresh-token',
      method: 'POST',
      isRefresh: true,
      dispatch,
      getState,
    })
      .then((data) => {
        const {
          accessToken,
          accessTokenExpiredAt,
          refreshToken,
          refreshTokenExpiredAt,
        } = data;
        localStorage.setItem(
          'token-data',
          JSON.stringify({
            accessToken,
            accessTokenExpiredAt,
            refreshToken,
            refreshTokenExpiredAt,
          })
        );
        dispatch(setTokenData(data));
        resolve(resolve);
      })
      .catch((error) => reject(error));
  });

export const logout = () => (dispatch) => {
  localStorage.removeItem('token-data');
  dispatch(logoutUser());
  openNotification({
    text: 'Вы вышли из системы',
    variant: 'info',
  });
};

export const saveProfile = ({
  firstName,
  surName,
  middleName,
  oldPassword,
  newPassword,
  avatar,
}) => (dispatch, getState) =>
  new Promise((resolve) => {
    const data = new FormData();
    data.append('firstName', firstName);
    data.append('surName', surName);
    data.append('middleName', middleName);
    data.append('oldPassword', oldPassword);
    data.append('newPassword', newPassword);
    data.append('avatar', avatar);

    dispatch(setIsLoadingUserProfile(true));
    request({ url: '/profile', method: 'PATCH', data, getState, dispatch })
      .then((data) => {
        dispatch(setProfileData(data));
        dispatch(
          openNotification({
            text: 'Профиль успешно обновлен!',
            variant: 'success',
          })
        );
        resolve(true);
      })
      .catch((error) =>
        dispatch(openNotification({ text: error.message, variant: 'error' }))
      )
      .finally(() => dispatch(setIsLoadingUserProfile(false)));
  });
