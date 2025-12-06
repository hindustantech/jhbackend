import Gallery from '../models/gallary.js';
import { uploadToCloudinary } from '../middleware/upload.js';
import cloudinary from '../config/cloudinary.js';

// Get all gallery items
export const getAllGalleryItems = async (req, res) => {
  try {
    const { 
      isActive = 'true', 
      position, 
      sortBy = 'order', 
      sortOrder = 'asc',
      limit = 100,
      page = 1 
    } = req.query;

    // Build filter
    const filter = {};
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (position) {
      filter.position = position;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const galleryItems = await Gallery.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Gallery.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: galleryItems.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: galleryItems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get gallery item by ID
export const getGalleryItemById = async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id).select('-__v');

    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    res.status(200).json({
      success: true,
      data: galleryItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create new gallery item
export const createGalleryItem = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Extract form data
    const { title, description, position, isActive, order } = req.body;

    try {
      // Upload to Cloudinary
      const cloudinaryResult = await uploadToCloudinary(
        req.file.buffer, 
        req.file.originalname
      );

      // Get optimized URLs
      const getOptimizedUrls = (publicId) => {
        const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;
        return {
          original: cloudinaryResult.secure_url,
          hd: `${baseUrl}/c_limit,w_1920,q_auto:best/${publicId}`,
          large: `${baseUrl}/c_limit,w_1280,q_auto:good/${publicId}`,
          medium: `${baseUrl}/c_limit,w_800,q_auto:good/${publicId}`,
          small: `${baseUrl}/c_limit,w_400,q_auto:good/${publicId}`,
          thumbnail: `${baseUrl}/c_fill,w_300,h_200,q_auto:good/${publicId}`
        };
      };

      const urls = getOptimizedUrls(cloudinaryResult.public_id);

      // Calculate order for position
      let calculatedOrder = parseInt(order) || 0;
      if (position && !order) {
        const maxOrderItem = await Gallery.findOne({ position })
          .sort('-order')
          .select('order');
        
        calculatedOrder = maxOrderItem ? maxOrderItem.order + 1 : 0;
      }

      // Create gallery item
      const galleryItem = new Gallery({
        url: urls.original,
        optimizedUrl: urls.hd,
        thumbnailUrl: urls.thumbnail,
        cloudinaryPublicId: cloudinaryResult.public_id,
        title: title || '',
        description: description || '',
        position: position || 'middle',
        isActive: isActive !== undefined ? isActive === 'true' : true,
        order: calculatedOrder,
        imageInfo: {
          format: cloudinaryResult.format,
          width: cloudinaryResult.width,
          height: cloudinaryResult.height,
          size: cloudinaryResult.bytes,
          originalFilename: req.file.originalname,
          mimeType: req.file.mimetype
        }
      });

      await galleryItem.save();

      res.status(201).json({
        success: true,
        message: 'Gallery item created successfully',
        data: galleryItem
      });

    } catch (uploadError) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload image to Cloudinary',
        error: uploadError.message
      });
    }

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating gallery item',
      error: error.message
    });
  }
};

// Update gallery item
export const updateGalleryItem = async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);
    
    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    const { title, description, position, isActive, order } = req.body;

    // Update image if new file uploaded
    if (req.file) {
      try {
        // Delete old image from Cloudinary
        if (galleryItem.cloudinaryPublicId) {
          await cloudinary.uploader.destroy(galleryItem.cloudinaryPublicId);
        }

        // Upload new image
        const cloudinaryResult = await uploadToCloudinary(
          req.file.buffer,
          req.file.originalname
        );

        // Update URLs
        galleryItem.url = cloudinaryResult.secure_url;
        galleryItem.cloudinaryPublicId = cloudinaryResult.public_id;
        galleryItem.imageInfo = {
          format: cloudinaryResult.format,
          width: cloudinaryResult.width,
          height: cloudinaryResult.height,
          size: cloudinaryResult.bytes,
          originalFilename: req.file.originalname,
          mimeType: req.file.mimetype
        };

        // Generate new optimized URLs
        const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;
        galleryItem.optimizedUrl = `${baseUrl}/c_limit,w_1920,q_auto:best/${cloudinaryResult.public_id}`;
        galleryItem.thumbnailUrl = `${baseUrl}/c_fill,w_300,h_200,q_auto:good/${cloudinaryResult.public_id}`;

      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload new image',
          error: uploadError.message
        });
      }
    }

    // Update other fields
    if (title !== undefined) galleryItem.title = title;
    if (description !== undefined) galleryItem.description = description;
    if (position !== undefined) galleryItem.position = position;
    if (isActive !== undefined) galleryItem.isActive = isActive === 'true';
    if (order !== undefined) galleryItem.order = parseInt(order);

    await galleryItem.save();

    res.status(200).json({
      success: true,
      message: 'Gallery item updated successfully',
      data: galleryItem
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating gallery item',
      error: error.message
    });
  }
};

// Delete gallery item
export const deleteGalleryItem = async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);
    
    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    // Delete from Cloudinary
    if (galleryItem.cloudinaryPublicId) {
      try {
        await cloudinary.uploader.destroy(galleryItem.cloudinaryPublicId);
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
      }
    }

    await galleryItem.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Gallery item deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting gallery item',
      error: error.message
    });
  }
};

// Toggle active status
export const toggleGalleryActive = async (req, res) => {
  try {
    const galleryItem = await Gallery.findById(req.params.id);
    
    if (!galleryItem) {
      return res.status(404).json({
        success: false,
        message: 'Gallery item not found'
      });
    }

    galleryItem.isActive = !galleryItem.isActive;
    await galleryItem.save();

    res.status(200).json({
      success: true,
      message: `Gallery item ${galleryItem.isActive ? 'activated' : 'deactivated'}`,
      data: galleryItem
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error toggling gallery item',
      error: error.message
    });
  }
};

// Update multiple orders (for drag & drop)
export const updateMultipleOrders = async (req, res) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required'
      });
    }

    const bulkOps = items.map(item => ({
      updateOne: {
        filter: { _id: item.id },
        update: { order: item.order }
      }
    }));

    await Gallery.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: 'Orders updated successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating orders',
      error: error.message
    });
  }
};

// Get by position
export const getGalleryByPosition = async (req, res) => {
  try {
    const { position } = req.params;
    const { isActive = 'true', limit = 50 } = req.query;

    const galleryItems = await Gallery.find({
      position: position,
      isActive: isActive === 'true'
    })
    .sort({ order: 1, createdAt: -1 })
    .limit(parseInt(limit))
    .select('-__v');

    res.status(200).json({
      success: true,
      count: galleryItems.length,
      data: galleryItems
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching gallery items',
      error: error.message
    });
  }
};