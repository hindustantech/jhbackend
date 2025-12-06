// utils/apiHelpers.js

// utils/apiHelpers.js - Fix parsePagination
export const parsePagination = (query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(query.limit) || 10));
    const skip = (page - 1) * limit;
    
    return { page, limit, skip };
}; 

// utils/apiHelpers.js - Fix buildSearchQuery
export const buildSearchQuery = (searchTerm = '', fields = []) => {
    if (!searchTerm.trim() || fields.length === 0) {
        return {};
    }
    
    const searchRegex = new RegExp(searchTerm, 'i'); // Case-insensitive
    
    return {
        $or: fields.map(field => ({
            [field]: searchRegex
        }))
    };
};