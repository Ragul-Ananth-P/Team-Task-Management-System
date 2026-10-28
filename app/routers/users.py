from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.deps import get_current_user, require_admin
from app.core.security import hash_password
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse, UserUpdate

router = APIRouter(prefix="/users", tags=["Users"])


def email_taken(db: Session, email: str, exclude_id: int | None = None) -> bool:
    query = db.query(User).filter(User.email == email)
    if exclude_id:
        query = query.filter(User.id != exclude_id)
    return query.first() is not None


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    email = user_in.email.lower()
    if email_taken(db, email):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(
        name=user_in.name,
        email=email,
        password=hash_password(user_in.password),
        role=user_in.role,
    )
    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    db.refresh(user)
    return user


@router.get("", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    return db.query(User).order_by(User.id).all()


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_user)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    email = user_in.email.lower()
    if email_taken(db, email, exclude_id=user.id):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    if user.id == admin.id and user_in.role != user.role:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot change your own role")

    user.name = user_in.name
    user.email = email
    user.role = user_in.role
    if user_in.password:
        user.password = hash_password(user_in.password)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    db.refresh(user)
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin),
):
    if user_id == admin.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You cannot delete your own account")
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    db.delete(user)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User still has projects or tasks. Reassign or delete them first.",
        )