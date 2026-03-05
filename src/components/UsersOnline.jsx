export default function UsersOnline({ users }) {
  return (
    <div className="dashboard-card">
      <h3>Users Online</h3>

      {users.length === 0 ? (
        <p>No users online</p>
      ) : (
        <ul className="online-users">
          {users.map(email => (
            <li key={email}>
              <span className="online-dot"></span>
              {email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
