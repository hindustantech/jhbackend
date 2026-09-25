import express from "express";
import { importBills, getAllBills, getImportStats, deleteBill, updateBillStatus, getCustomerInsights, getCustomerRanking, exportAllRanking } from "../controllers/bulkImportController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorizationMiddleware.js";

const router = express.Router();

router.post("/import", protect, authorize("bills:manage"), importBills);
router.get("/", protect, authorize("bills:manage"), getAllBills);
router.get("/stats", protect, authorize("bills:manage"), getImportStats);
router.delete("/:id", protect, authorize("bills:manage"), deleteBill);
router.patch("/:id/status", protect, authorize("bills:manage"), updateBillStatus);
router.get("/customer/:phone", protect, authorize("customers:manage"), getCustomerInsights);
router.get("/ranking/:type", protect, authorize("ranking:view"), getCustomerRanking);
router.get("/ranking/export/:type", protect, authorize("ranking:view"), exportAllRanking);

export default router;
