const express = require("express");
const { addProduct, getProduct, verifyProduct,generateProductQR  } = require("../controllers/productController");

const router = express.Router();

router.post("/add", addProduct);       // 添加药品
router.get("/:id", getProduct);        // 查询药品
router.post("/verify", verifyProduct); // 验证药品
router.post("/generate-qr", generateProductQR); // generate QR

module.exports = router;
