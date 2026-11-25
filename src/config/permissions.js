export function canManageMaintenance(user) {
  return user === 'admin'
}

export function canCancelBooking({ user, env }, booking) {
  return booking.user === user && booking.env === env
}
