export default function NotificationBell({ count }) {
  return (
    <div className="notif-bell">
      🔔 {count > 0 && <span>{count}</span>}
    </div>
  );
}
