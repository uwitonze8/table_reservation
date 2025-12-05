import { useState } from 'react';
import axios from 'axios';

const CreateReservation = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [numberOfGuests, setNumberOfGuests] = useState(1);
    const [reservationDate, setReservationDate] = useState('');
    const [reservationTime, setReservationTime] = useState('');
    const [specialRequests, setSpecialRequests] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/reservations', {
                fullName,
                email,
                phone,
                numberOfGuests,
                reservationDate,
                reservationTime,
                specialRequests,
            });
            console.log('Reservation created:', response.data);
            // Handle successful reservation creation (e.g., redirect or show a success message)
        } catch (error) {
            console.error('Error creating reservation:', error);
            // Handle error (e.g., show an error message)
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Create Reservation</h2>
            <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <input
                type="tel"
                placeholder="Phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
            />
            <input
                type="number"
                placeholder="Number of Guests"
                value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(e.target.value)}
                min="1"
                required
            />
            <input
                type="date"
                value={reservationDate}
                onChange={(e) => setReservationDate(e.target.value)}
                required
            />
            <input
                type="time"
                value={reservationTime}
                onChange={(e) => setReservationTime(e.target.value)}
                required
            />
            <textarea
                placeholder="Special Requests (optional)"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
            />
            <button type="submit">Create Reservation</button>
        </form>
    );
};

export default CreateReservation;