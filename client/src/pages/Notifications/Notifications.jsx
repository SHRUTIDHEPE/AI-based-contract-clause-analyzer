import { useEffect, useState } from "react";
import { getNotifications } from "../../api/notifications";

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    (async () => {
      const r = await getNotifications();
      setNotifs(r.data.notifications);
    })();
  }, []);

  return (
    <div>
      <h2>Notifications</h2>
      {notifs.map((n) => (
        <div key={n.id}>
          {n.message} — {new Date(n.createdAt).toLocaleString()}
        </div>
      ))}
    </div>
  );
}
