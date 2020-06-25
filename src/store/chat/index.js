import socketIO from 'socket.io-client';
import { createAction, handleActions } from 'redux-actions';
import { combineReducers } from 'redux';
import { userProfileSelector } from '../auth';
let socket = null;

export const chatUsersSelector = state => state.chat.users;
export const chatMessagesList = state => state.chat.messages;
export const chatSelectedRoomSelector = state => state.chat.selectedRoom;
export const chatMessageText = state => state.chat.messageText;

const actionsPrefix = 'CHAT';
export const setUsers = createAction(`${actionsPrefix}/SET_USERS`);
export const addUser = createAction(`${actionsPrefix}/ADD_USER`);
export const updateUser = createAction(`${actionsPrefix}/UPDATE_USER`);
export const removeUser = createAction(`${actionsPrefix}/REMOVE_USER`);
export const appendMessage = createAction(`${actionsPrefix}/ADD_MESSAGE`);
export const setRoomHistory = createAction(`${actionsPrefix}/SET_ROOM_HISTORY`);
export const setToZeroMessages = createAction(`${actionsPrefix}/SET_TO_ZERO_MESSAGES`);
export const setSelectedRoom = createAction(`${actionsPrefix}/SET_SELECTED_ROOM`);
export const setMessageText = createAction(`${actionsPrefix}/SET_MESSAGE_TEXT`);
export const resetMessage = createAction(`${actionsPrefix}/RESET_MESSAGE`);

const users = handleActions(
  {
    [setUsers]: (_, action) => action.payload,
    [addUser]: (state, action) => [action.payload, ...state],
    [updateUser]: (state, action) => state.map(user => user.userId === action.payload.userId ? action.payload : user),
    [removeUser]: (state, action) => state.filter(user => user.socketId !== action.payload)
  },
  []
);

const messages = handleActions(
  {
    [appendMessage]: (state, action) =>  [...state, action.payload],
    [setRoomHistory]: (state, action) => action.payload,
    [setToZeroMessages]: () => []
  },
  []
);

const selectedRoom = handleActions(
  {
    [setSelectedRoom]: (_, action) => action.payload
  },
  null
);

const messageText = handleActions({
  [setMessageText]: (_, action) => action.payload,
  [resetMessage]: () => ''
}, '')

export default combineReducers({
  users,
  messages,
  selectedRoom,
  messageText
});

export const connectSocket = () => (dispatch, getState) => {
  const userProfile = userProfileSelector(getState());
  socket = socketIO('/');

  socket.emit('users:connect', { userId: userProfile.id, username: userProfile.username });

  socket
    .on('users:list', data => dispatch(setUsers(data)))
    .on('users:add', data => dispatch(addUser(data)))
    .on('users:leave', data => {
      dispatch(removeUser(data))
      const selectedRoom = chatSelectedRoomSelector(getState())
      if (selectedRoom && selectedRoom.socketId === data) dispatch(setSelectedRoom(null))
    })
    .on('message:history', data => dispatch(setRoomHistory(data)))
    .on('message:add', data => dispatch(appendMessage(data)));
};

export const connectRoom = ({ userId, socketId }) => (dispatch, getState) => {
  const userProfile = userProfileSelector(getState());
  dispatch(setToZeroMessages())
  dispatch(setSelectedRoom({ recipientId: userId, socketId }))
  
  socket.emit('message:history', { recipientId: userId, userId: userProfile.id })
}

export const sendMessage = () => (dispatch, getState) => {
  const state = getState()
  const userProfile = userProfileSelector(state);
  const selectedRoom = chatSelectedRoomSelector(state);
  const messageText = chatMessageText(state)
  socket.emit('message:add', { senderId: userProfile.id, recipientId: selectedRoom.recipientId, roomId: selectedRoom.socketId, text: messageText });
  dispatch(resetMessage())
};


export const disconnectSocket = () => (dispatch) => {
  socket && socket.disconnect()
  dispatch(setUsers([]))
  dispatch(setToZeroMessages())
  dispatch(setSelectedRoom(null))
  dispatch(resetMessage())
}
