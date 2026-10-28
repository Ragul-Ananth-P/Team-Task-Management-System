import { colorFor, initials } from "../utils.js";

export default function Avatar({ user, large }) {
  if (!user) return null;
  return (
    <span
      className={`avatar ${large ? "lg" : ""}`}
      style={{ background: colorFor(user.id) }}
      title={user.name}
    >
      {initials(user.name)}
    </span>
  );
}
