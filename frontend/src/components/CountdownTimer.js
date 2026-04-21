import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';

const CountdownTimer = ({ acceptanceTime }) => {
    // Function to calculate the remaining time
    const calculateTimeLeft = useCallback(() => {
        const now = moment();
        const deadline = moment(acceptanceTime).add(3, 'minutes'); // Deadline set to 3 minutes after order acceptance
        const difference = deadline.diff(now); // Time difference in milliseconds

        if (difference <= 0) {
            return 'Order time has expired';
        }

        const duration = moment.duration(difference);
        const minutes = duration.minutes();
        const seconds = duration.seconds();

        return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`; // Format remaining time
    }, [acceptanceTime]);

    const [timeLeft, setTimeLeft] = useState(() => calculateTimeLeft());

    useEffect(() => {
        // Update the timer every second
        const interval = setInterval(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);
        }, 1000); // Update every second

        return () => clearInterval(interval); // Clear interval when the component is unmounted
    }, [calculateTimeLeft]);

    return <span>{timeLeft}</span>;
};

export default CountdownTimer;
