import multer from "multer";

const memoryStorage = multer.memoryStorage();

const spreadsheetFilter = (req, file, cb) => {
    const allowedMimes = [
        "text/csv",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.oasis.opendocument.spreadsheet",
        "application/octet-stream"
    ];
    const allowedExts = [".csv", ".xlsx", ".xls", ".ods"];
    const ext = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf("."));
    if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only CSV and Excel files are allowed."), false);
    }
};

export const uploadSpreadsheet = multer({
    storage: memoryStorage,
    fileFilter: spreadsheetFilter,
    limits: {
        fileSize: 10 * 1024 * 1024,
        files: 1
    }
}).single("file");

export const handleSpreadsheetUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(413).json({ ok: false, message: "File too large. Max 10MB allowed." });
        }
        return res.status(400).json({ ok: false, message: `Upload error: ${err.message}` });
    } else if (err) {
        return res.status(400).json({ ok: false, message: err.message });
    }
    next();
};
