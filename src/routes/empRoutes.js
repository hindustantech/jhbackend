import express from "express";
import { createEmp, getAllEmps, getEmpById, updateEmp, deleteEmp } from "../controllers/empController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authorizationMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("employees:manage"), createEmp);
router.get("/", getAllEmps);
router.get("/:id", protect, authorize("employees:manage"), getEmpById);
router.put("/:id", protect, authorize("employees:manage"), updateEmp);
router.delete("/:id", protect, authorize("employees:manage"), deleteEmp);

export default router;