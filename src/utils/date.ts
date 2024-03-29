export function getFormatDate() {
    const d: Date = new Date();

    return formatDate(d.toString());
}

export function formatDate(date: string | null): string | null {
    if (date) {
        const newDate = Date.parse(date);
        const d = new Date(newDate);
        let day = `${d.getDate()}`;
        let month = `${d.getMonth() + 1}`;
        const year = d.getFullYear();

        if (month.length < 2)
            month = '0' + month;
        if (day.length < 2)
            day = '0' + day;

        return `${year}-${month}-${day}`;
    }
    return null;
}
