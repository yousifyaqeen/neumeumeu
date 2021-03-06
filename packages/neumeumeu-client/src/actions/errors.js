export function addErrorMessage(text, duration) {
  return {
    type: "ADD_ERROR_MESSAGE",
    message: {
      text,
      duration,
    },
  };
}

export function popLastErrorMessage() {
  return {
    type: "POP_LAST_ERROR_MESSAGE",
  };
}

export default {
  addErrorMessage,
  popLastErrorMessage,
};
