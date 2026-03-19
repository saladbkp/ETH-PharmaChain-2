import { useState } from "react";
import { QrReader } from "react-qr-reader";
import axios from "axios";
import jsQR from "jsqr";

const QRScanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);

    // 处理摄像头扫描
    const handleScan = async (data) => {
        if (data) {
            setScanResult(data);
            try {
                const response = await axios.post("http://localhost:5000/api/products/verify", {
                    serialNumber: data,
                });

                alert(`✅ 药品验证成功！\n名称: ${response.data.product.name}\n制造商: ${response.data.product.manufacturer}`);
            } catch (err) {
                setError("⚠️ 无法验证该药品！");
                alert("⚠️ 无法验证该药品！");
            }
        }
    };

    const handleError = (err) => {
        console.error(err);
        setError("扫描出错！");
    };

    // 处理上传的二维码图片
    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, img.width, img.height);
                const imageData = ctx.getImageData(0, 0, img.width, img.height);
                
                const code = jsQR(imageData.data, img.width, img.height);
                if (code) {
                    handleScan(code.data);
                } else {
                    setError("❌ 无法识别二维码！");
                }
            };
        };
        reader.readAsDataURL(file);
    };

    return (
        <div>
            <h2>扫描药品二维码</h2>
            
            {/* 1️⃣ 摄像头扫描二维码 */}
            {/* <QrReader
                constraints={{ facingMode: "environment" }}
                onResult={(result, error) => {
                    if (result) handleScan(result.text);
                    if (error) handleError(error);
                }}
                style={{ width: "100%" }}
            /> */}

            <br />

            {/* 2️⃣ 选择上传二维码图片 */}
            <input type="file" accept="image/*" onChange={handleImageUpload} />

            {/* 结果显示 */}
            {scanResult && <p>✅ 扫描结果: {scanResult}</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
};

export default QRScanner;
