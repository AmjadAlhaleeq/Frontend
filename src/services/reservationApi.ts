
// Main API file - re-exports everything for backward compatibility
export * from './reservationTypes';
export * from './publicReservationApi';
export * from './adminReservationApi';
export * from './playerReservationApi';

// Legacy aliases for backward compatibility
export { getAllReservations as fetchAllReservations } from './publicReservationApi';
export { getReservationById as fetchReservationById } from './publicReservationApi';
export { deleteReservationApi as deleteReservationById } from './adminReservationApi';
export { removeFromWaitlist as leaveWaitlist } from './playerReservationApi';
