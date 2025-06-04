import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

// API endpoint for checking vehicle
app.post('/api/check-vehicle', async (req, res) => {
    const MAX_RETRIES = 3;
    let attempts = 0;
    let lastError = null;

    const { 
        licensePlate, 
        tem,
        bien
    } = req.body;
    
    if (!licensePlate) {
        return res.status(400).json({ 
            success: false,
            message: 'Biển số xe là bắt buộc' 
        });
    }

    while (attempts < MAX_RETRIES) {
        try {
            attempts++;
            console.log(`Thử lần thứ ${attempts}...`);
            
            const url = "https://phatnguoi.com/action.php";
            const formData = new URLSearchParams({
                type: "2",
                retry: "1",
                loaixe: "1",
                bsx: "",
                bsxdangkiem: licensePlate,
                bien: bien,
                tem: tem
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
                timeout: 10000 // 10 seconds timeout
            });

            // If request is successful, return the response
            return res.json({
                success: true,
                attempts: attempts,
                data: response.data
            });

        } catch (error) {
            lastError = error;
            console.error(`Lỗi lần thử ${attempts}:`, error.message);
            
            // If this was the last attempt, break the loop
            if (attempts >= MAX_RETRIES) break;
            
            // Wait for 1 second before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // If we get here, all attempts failed
    console.error(`Đã thử lại ${MAX_RETRIES} lần nhưng không thành công`);
    res.status(500).json({
        success: false,
        message: `Không thể hoàn thành yêu cầu sau ${MAX_RETRIES} lần thử`,
        error: lastError?.message || 'Unknown error',
        lastAttempt: attempts
    });
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
