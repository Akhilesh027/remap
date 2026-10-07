// NotificationService/types.js

const NOTIFICATION_TYPES = {
    // For when an agent submits a new property
    PROPERTY_ADDED: 'PROPERTY_ADDED',
    
    // For when an admin changes the status of a property
    PROPERTY_STATUS_UPDATE: 'PROPERTY_STATUS_UPDATE', 
    
    // For general messages
    MESSAGE_RECEIVED: 'MESSAGE_RECEIVED',
    
    // ... add more types as needed
};

// Templates for message formatting (can be simple functions)
const TEMPLATES = {
    PROPERTY_ADDED: {
        // Targets the Admin/Approver
        title: (data) => `New Property Submission: ${data.propertyName}`,
        message: (data) => `Property **${data.propertyName}** is pending approval. Review it now.`,
        entityType: 'Property'
    },
    PROPERTY_APPROVED: {
        // Targets the Agent (Example for a follow-up notification)
        title: (data) => `Property Approved! 🎉`,
        message: (data) => `Your property **${data.propertyName}** is now **Live** on the platform.`,
        entityType: 'Property'
    }
};

module.exports = { NOTIFICATION_TYPES, TEMPLATES };