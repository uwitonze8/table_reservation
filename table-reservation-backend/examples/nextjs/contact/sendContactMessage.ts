import axios from 'axios';

const sendContactMessage = async (contactData) => {
    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`, contactData);
        return response.data;
    } catch (error) {
        console.error('Error sending contact message:', error);
        throw error;
    }
};

export default sendContactMessage;