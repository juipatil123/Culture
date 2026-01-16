export const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    let date;
    if (dateString && typeof dateString.toDate === 'function') {
        date = dateString.toDate();
    } else {
        date = new Date(dateString);
    }
    if (isNaN(date.getTime())) return 'N/A';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

// Format as "DD/MM/YYYY HH:MM AM/PM"
export const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    let date;
    if (dateString && typeof dateString.toDate === 'function') {
        date = dateString.toDate();
    } else {
        date = new Date(dateString);
    }
    if (isNaN(date.getTime())) return 'N/A';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'

    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
};

// Format date range as "DD/MM/YYYY - DD/MM/YYYY"
export const formatDateRange = (startDate, endDate) => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);

    if (start === 'N/A' && end === 'N/A') return 'N/A';
    if (start === 'N/A') return `Until ${end}`;
    if (end === 'N/A') return `From ${start}`;

    return `${start} - ${end}`;
};

// Format date as "DD-MM-YY" (2-digit year)
export const formatDateShort = (dateString) => {
    if (!dateString) return 'N/A';
    let date;
    if (dateString && typeof dateString.toDate === 'function') {
        date = dateString.toDate();
    } else {
        date = new Date(dateString);
    }
    if (isNaN(date.getTime())) return 'N/A';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2); // Get last 2 digits

    return `${day}-${month}-${year}`;
};
