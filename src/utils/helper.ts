export function formatDate(str:string) {
    let year, month, day;

    if (str.length === 8) {
        // For format YYYYMMDD
        year = str.slice(0, 4);
        month = str.slice(4, 6).replace(/^0+/, ''); // Remove leading zeros
        day = str.slice(6).replace(/^0+/, ''); // Remove leading zeros
    } else if (str.length === 6) {
        // For format YYYYMM
        year = str.slice(0, 4);
        month = str.slice(4, 5).replace(/^0+/, ''); // Remove leading zeros
        day = str.slice(5).replace(/^0+/, ''); // Remove leading zeros
    } else {
        return "Invalid input";
    }

    return `${year}-${month}-${day}`;
}