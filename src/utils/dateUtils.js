export const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';

    // Handle Firebase Timestamp objects
    const dateVal = dateString.seconds ? dateString.seconds * 1000 : dateString;
    const date = new Date(dateVal);

    if (isNaN(date.getTime())) return 'N/A';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    // Handle Firebase Timestamp objects
    const dateVal = dateString.seconds ? dateString.seconds * 1000 : dateString;
    const date = new Date(dateVal);

    if (isNaN(date.getTime())) return 'N/A';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};
