const QRCode = require("qrcode");

/**
 * 生成药品的二维码
 * @param {string} serialNumber - 药品唯一序列号
 * @returns {Promise<string>} - 返回二维码的 Base64 数据
 */
const generateQRCode = async (serialNumber) => {
    try {
        return await QRCode.toDataURL(serialNumber);
    } catch (error) {
        console.error("qr code generation failed:", error);
        throw new Error("qr code generation failed");
    }
};

module.exports = generateQRCode;
