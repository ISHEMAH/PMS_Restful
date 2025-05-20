// Calculate duration in hours between two dates
export const calculateDuration = (startTime: Date, endTime: Date): number => {
    const durationMs = endTime.getTime() - startTime.getTime();
    return durationMs / (1000 * 60 * 60); // Convert to hours
};

// Calculate amount based on duration and rate
export const calculateAmount = (durationHours: number, ratePerHour: number): number => {
    return durationHours * ratePerHour;
};

// Format currency
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-RW', {
        style: 'currency',
        currency: 'RWF'
    }).format(amount);
};

// Format duration
export const formatDuration = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);

    if (wholeHours === 0) {
        return `${minutes} minutes`;
    }

    return `${wholeHours} hour${wholeHours !== 1 ? 's' : ''} ${minutes > 0 ? `${minutes} minute${minutes !== 1 ? 's' : ''}` : ''}`;
}; 