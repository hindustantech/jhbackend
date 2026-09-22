import express from "express";
import { createEmp, getAllEmps, getEmpById, updateEmp, deleteEmp } from "../controllers/empController.js";

const router = express.Router();

router.post("/", createEmp);
router.get("/", getAllEmps);
router.get("/:id", getEmpById);
router.put("/:id", updateEmp);
router.delete("/:id", deleteEmp);

export default router;