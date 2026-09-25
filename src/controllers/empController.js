import Emp from "../models/empSchema.js";
import User from "../models/User.js";

const normalizePhone = (phone) => {
    const clean = phone.replace(/\s/g, "");
    if (clean.startsWith("+91")) return clean;
    if (clean.startsWith("91")) return `+${clean}`;
    return `+91${clean}`;
};

export const createEmp = async (req, res, next) => {
    try {
        const { name, phone, role, specialization, empId, joinDate, email, password, permissions } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ ok: false, message: "Name and phone are required" });
        }

        const phoneRegex = /^\+?(91)?[6-9]\d{9}$/;
        const cleanPhone = phone.replace(/\s/g, "");
        if (!phoneRegex.test(cleanPhone)) {
            return res.status(400).json({ ok: false, message: "Please provide a valid Indian phone number" });
        }

        const normalizedPhone = normalizePhone(phone);

        let userId = null;

        if (email && password) {
            const existingUser = await User.findOne({ $or: [{ email }, { mobile: normalizedPhone }] });
            if (existingUser) {
                return res.status(400).json({ ok: false, message: "User with this email or phone already exists" });
            }

            const user = await User.create({
                name,
                email,
                mobile: normalizedPhone,
                password,
                role: "employee",
                permissions: permissions || []
            });
            userId = user._id;
        }

        const emp = await Emp.create({
            name,
            phone: normalizedPhone,
            role: role || "",
            specialization: specialization || "",
            empId: empId || "",
            joinDate: joinDate || null,
            userId
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
        const emps = await Emp.find().populate("userId", "email role permissions").sort({ createdAt: -1 });
        res.json({ ok: true, data: emps });
    } catch (error) {
        next(error);
    }
};

export const getEmpById = async (req, res, next) => {
    try {
        const emp = await Emp.findById(req.params.id).populate("userId", "email role permissions");
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
        const { name, phone, role, specialization, empId, joinDate, email, password, permissions } = req.body;

        const emp = await Emp.findById(req.params.id);
        if (!emp) {
            return res.status(404).json({ ok: false, message: "Employee not found" });
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = normalizePhone(phone);
        if (role !== undefined) updateData.role = role;
        if (specialization !== undefined) updateData.specialization = specialization;
        if (empId !== undefined) updateData.empId = empId;
        if (joinDate !== undefined) updateData.joinDate = joinDate;

        const updatedEmp = await Emp.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });

        if (emp.userId) {
            const userUpdate = {};
            if (email !== undefined) userUpdate.email = email;
            if (password) userUpdate.password = password;
            if (permissions !== undefined) userUpdate.permissions = permissions;
            if (name !== undefined) userUpdate.name = name;
            if (phone !== undefined) userUpdate.mobile = normalizePhone(phone);

            if (Object.keys(userUpdate).length > 0) {
                await User.findByIdAndUpdate(emp.userId, userUpdate);
            }
        }

        res.json({ ok: true, message: "Employee updated successfully", data: updatedEmp });
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

        if (emp.userId) {
            await User.findByIdAndDelete(emp.userId);
        }

        res.json({ ok: true, message: "Employee deleted successfully" });
    } catch (error) {
        next(error);
    }
};