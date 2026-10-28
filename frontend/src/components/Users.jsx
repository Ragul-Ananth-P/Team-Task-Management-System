import { fmtFull } from "../utils.js";
import Avatar from "./Avatar.jsx";

export default function Users({ users, currentUser, isAdmin, onEdit, onDelete }) {
  return (
    <section className="active">
      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Joined</th>
              {isAdmin && <th />}
            </tr>
          </thead>
          <tbody>
            {users.length ? (
              users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="who">
                      <Avatar user={u} large />
                      <div>
                        <b>{u.name}</b>
                        <div className="muted">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`pill ${u.role}`}>{u.role === "ADMIN" ? "Admin" : "Employee"}</span></td>
                  <td className="muted">{fmtFull(u.created_at)}</td>
                  {isAdmin && (
                    <td>
                      <div className="actions">
                        <button className="mini" onClick={() => onEdit(u)}>Edit</button>
                        {u.id !== currentUser.id && (
                          <button className="mini danger" onClick={() => onDelete(u)}>Delete</button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr><td colSpan={isAdmin ? 4 : 3} className="empty">No users</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
