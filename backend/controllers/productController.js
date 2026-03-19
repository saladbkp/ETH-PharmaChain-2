const products = require("../models/Product");
const { v4: uuidv4 } = require("uuid");
const generateQRCode = require("../utils/qrGenerator");

// Add product
const addProduct = (req, res) => {
    const { name, manufacturer, serialNumber } = req.body;

    if (!name || !manufacturer || !serialNumber) {
        return res.status(400).json({ message: "All fields are required" });
    }

    const newProduct = {
        id: uuidv4(),
        name,
        manufacturer,
        serialNumber,
    };

    products.push(newProduct);
    res.status(201).json({ message: "Product added successfully", product: newProduct });
};

// Get product
const getProduct = (req, res) => {
    const { id } = req.params;
    const product = products.find(p => p.id === id);

    if (!product) {
        return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
};

// Verify product (by serial number)
const verifyProduct = (req, res) => {
    const { serialNumber } = req.body;
    const product = products.find(p => p.serialNumber === serialNumber);

    if (!product) {
        return res.status(404).json({ message: "Product does not exist or may be counterfeit" });
    }

    res.json({ message: "Product verification successful", product });
};

const generateProductQR = async (req, res) => {
    try {
        const { serialNumber } = req.body;
        if (!serialNumber) {
            return res.status(400).json({ message: "serial number not found" });
        }

        const qrCode = await generateQRCode(serialNumber);
        res.json({ qrCode });
    } catch (error) {
        res.status(500).json({ message: "server error" });
    }
};

module.exports = { addProduct, getProduct, verifyProduct,generateProductQR  };

