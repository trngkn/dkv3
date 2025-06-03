import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// API endpoint for checking vehicle
app.post('/api/check-vehicle', async (req, res) => {
    try {
        const { licensePlate } = req.body;
        
        if (!licensePlate) {
            return res.status(400).json({ 
                success: false,
                message: 'Biển số xe là bắt buộc' 
            });
        }

        const url = "https://phatnguoi.com/action.php";
        const formData = new URLSearchParams({
            type: "1",
            retry: "1",
            loaixe: "1",
            bsx: licensePlate,
            bsxdangkiem: "",
            bien: "T",
            tem: ""
        });

        const headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
            "Referer": "https://phatnguoi.com",
            "Content-Type": "application/x-www-form-urlencoded",
        };

        const cookies = {
            vehicle_data: JSON.stringify({
                license_plate: licensePlate,
                captcha_status: "valid",
            }),
        };

        const response = await axios.post(url, formData.toString(), {
            headers: {
                ...headers,
                Cookie: `vehicle_data=${encodeURIComponent(cookies.vehicle_data)}`,
            },
        });

        res.json({
            success: true,
            data: response.data
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Có lỗi xảy ra khi kiểm tra biển số xe',
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'running',
        message: 'API kiểm tra biển số xe đang hoạt động'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
