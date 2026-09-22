import Emp from "../models/empSchema.js";

const normalizePhone = (phone) => {
    const clean = phone.replace(/\s/g, "");
    if (clean.startsWith("+91")) return clean;
    if (clean.startsWith("91")) return `+${clean}`;
    return `+91${clean}`;
};

export const createEmp = async (req, res, next) => {
    try {
        const { name, phone, role, specialization, empId, joinDate } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ ok: false, message: "Name and phone are required" });
        }

        const phoneRegex = /^\+?(91)?[6-9]\d{9}$/;
        const cleanPhone = phone.replace(/\s/g, "");
        if (!phoneRegex.test(cleanPhone)) {
            return res.status(400).json({ ok: false, message: "Please provide a valid Indian phone number" });
        }

        const normalizedPhone = normalizePhone(phone);

        const emp = await Emp.create({
            name,
            phone: normalizedPhone,
            role: role || "",
            specialization: specialization || "",
            empId: empId || "",
            joinDate: joinDate || null
        });

        res.status(201).json({ ok: true, message: "Employee created successfully", data: emp });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ ok: false, message: "Employee with this empId already exists" });
        }
        next(error);
    }
};

export const getAllEmps = async (req, res, next) => {
    try {
        const emps = await Emp.find().sort({ createdAt: -1 });
        res.json({ ok: true, data: emps });
    } catch (error) {
        next(error);
    }
};

export const getEmpById = async (req, res, next) => {
    try {
        const emp = await Emp.findById(req.params.id);
        if (!emp) {
            return res.status(404).json({ ok: false, message: "Employee not found" });
        }
        res.json({ ok: true, data: emp });
    } catch (error) {
        next(error);
    }
};

export const updateEmp = async (req, res, next) => {
    try {
        const { name, phone, role, specialization, empId, joinDate } = req.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = normalizePhone(phone);
        if (role !== undefined) updateData.role = role;
        if (specialization !== undefined) updateData.specialization = specialization;
        if (empId !== undefined) updateData.empId = empId;
        if (joinDate !== undefined) updateData.joinDate = joinDate;

        const emp = await Emp.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        if (!emp) {
            return res.status(404).json({ ok: false, message: "Employee not found" });
        }
        res.json({ ok: true, message: "Employee updated successfully", data: emp });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ ok: false, message: "Employee with this empId already exists" });
        }
        next(error);
    }
};

export const deleteEmp = async (req, res, next) => {
    try {
        const emp = await Emp.findByIdAndDelete(req.params.id);
        if (!emp) {
            return res.status(404).json({ ok: false, message: "Employee not found" });
        }
        res.json({ ok: true, message: "Employee deleted successfully" });
    } catch (error) {
        next(error);
    }
};