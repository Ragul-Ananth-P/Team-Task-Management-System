import getpass

from app.core.security import hash_password
from app.database import SessionLocal
from app.models.user import User, UserRole


def main():
    name = input("Name: ").strip() or "Admin"
    email = input("Email: ").strip().lower()
    password = getpass.getpass("Password (8-72 chars): ")

    if not email or not (8 <= len(password) <= 72):
        print("Email is required and the password must be 8-72 characters.")
        return

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.password = hash_password(password)
            user.role = UserRole.ADMIN
            action = "updated (password reset, role set to ADMIN)"
        else:
            user = User(
                name=name,
                email=email,
                password=hash_password(password),
                role=UserRole.ADMIN,
            )
            db.add(user)
            action = "created"
        db.commit()
        print(f"Admin {email} {action}.")
    finally:
        db.close()


if __name__ == "__main__":
    main()