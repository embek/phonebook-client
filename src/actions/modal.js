export const showDeleteModal = ({ id }) => dispatch => {
    dispatch({
        type: 'SHOW_DELETE_MODAL',
        contactId: id
    })
};

export const hideDeleteModal = () => dispatch => {
    dispatch({ type: 'HIDE_DELETE_MODAL' })
};

