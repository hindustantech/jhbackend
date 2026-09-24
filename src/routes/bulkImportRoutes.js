import express from "express";
import { importBills, getAllBills, getImportStats, deleteBill, updateBillStatus, getCustomerInsights, getCustomerRanking, exportAllRanking } from "../controllers/bulkImportController.js";

const router = express.Router();

router.post("/import", importBills);
router.get("/", getAllBills);
router.get("/stats", getImportStats);
router.delete("/:id", deleteBill);
router.patch("/:id/status", updateBillStatus);
router.get("/customer/:phone", getCustomerInsights);
router.get("/ranking/:type", getCustomerRanking);
router.get("/ranking/export/:type", exportAllRanking);

export default router;
