import axios from 'axios';
import { tokensSelector, refreshTokenRequest, logout } from '../store/auth';
import { openNotification } from '../store/notifications';
const baseURL = '/api/';
const instance = axios.create({ baseURL });

const waitQueue = [];
let isRefreshDispatched = false;

const request = ({
  url,
  method,
  data,
  headers = {},
  isRefresh,
  isWithoutToken,
  getState = () => ({}),
  dispatch = () => {},
}) =>
  new Promise((resolve, reject) => {
    const {
      accessToken,
      accessTokenExpiredAt,
      refreshTokenExpiredAt,
    } = tokensSelector(getState());

    // request handler
    const requestFunc = ({ url, method, headers, data, resolve, reject }) => {
      if (!isWithoutToken) {
        const { accessToken, refreshToken } = tokensSelector(getState());
        headers['Authorization'] = isRefresh ? refreshToken : accessToken;
      }

      return instance({ url, method, headers, data })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          if (error.response) {
            const status = error.response.status || 404;
            const errorResponse = error.response.data;
            console.group('Error from: ' + url);
            console.info('Status: ' + status);
            console.dir(errorResponse);
            console.groupEnd();

            switch (status) {
              case 401:
              case 403:
                dispatch(logout());
                return reject(errorResponse);
              case 500:
              case 502:
              case 503:
                dispatch(
                  openNotification({
                    variant: 'error',
                    text: `${status}!\nSomething is wrong))`,
                  })
                );
                return reject({ detail: 'Unknown error' });
              default:
                return reject(errorResponse);
            }
          } else {
            dispatch(
              openNotification({
                variant: 'error',
                text: `Error!!\n${error.message}`,
              })
            );
            return reject(error.message);
          }
        });
    };

    const isTokenExpired = accessTokenExpiredAt <= Date.now();
    const isRefreshExpired = refreshTokenExpiredAt <= Date.now();

    // If should refresh token
    if (accessToken && isTokenExpired && !isRefreshExpired && !isWithoutToken) {
      // push original request to waiting stack
      !isRefresh &&
        waitQueue.push({
          url,
          method,
          data,
          headers,
          isRefresh,
          resolve,
          reject,
        });

      // dispatch refresh token (first-time only!)
      if (!isRefresh && !isRefreshDispatched) {
        isRefreshDispatched = true;
        dispatch(refreshTokenRequest())
          .then(() => {
            isRefreshDispatched = false;
            // and after refresh - execute requests from waiting stack
            waitQueue.forEach((config) => requestFunc(config));
          })
          .catch(() => {
            // by default in error - logout user
            dispatch(logout());
            // eslint-disable-next-line
            reject({ detail: 'Refresh token error' });
          });
      } else if (isRefresh) {
        // if has been called refresh method
        requestFunc({ url, method, data, headers, resolve, reject });
      }
    } else if (isRefreshExpired && !isWithoutToken) {
      // if refresh is expired - just logout
      dispatch(logout());
      // eslint-disable-next-line
      reject({ detail: 'Refresh token is expired' });
    } else {
      // by default
      requestFunc({ url, method, data, headers, resolve, reject });
    }
  });

export default request;
