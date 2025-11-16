import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Profile() {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <h2>Profile</h2>
      {user && (
        <>
          <p>Name: {user.fullName}</p>
          <p>Email: {user.email}</p>
          <p>Username: {user.username}</p>
          <p>Last Login: {new Date(user.lastLogin).toLocaleString()}</p>
        </>
      )}
    </div>
  );
}
