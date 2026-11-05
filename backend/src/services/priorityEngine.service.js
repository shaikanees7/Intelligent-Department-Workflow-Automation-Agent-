/**
 * Rule-based intelligent priority scoring:
 * Identifies urgent requests based on lead days, event dates, and request type.
 */
class PriorityEngine {
  static assessPriority(startDate, requestType) {
    const today = new Date();
    const target = new Date(startDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // If event/leave starts within 2 days, mark as urgent automatically
    if (diffDays <= 2) {
      return { isUrgent: true, priorityScore: 90, label: 'HIGH - IMMEDIATE ACTION' };
    }
    if (diffDays <= 5) {
      return { isUrgent: false, priorityScore: 50, label: 'MEDIUM' };
    }
    return { isUrgent: false, priorityScore: 20, label: 'NORMAL' };
  }
}

module.exports = PriorityEngine;
