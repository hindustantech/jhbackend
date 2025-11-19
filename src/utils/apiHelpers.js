// utils/apiHelpers.js
export const parsePagination = (query) => {
    const page = Math.max(parseInt(query.page || '1', 10), 1);
    const limit = Math.max(parseInt(query.limit || '10', 10), 1);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};

export const buildSearchQuery = (q, fields = []) => {
    if (!q) return {};
    const regex = { $regex: q, $options: 'i' };
    return { $or: fields.map((f) => ({ [f]: regex })) };
};
