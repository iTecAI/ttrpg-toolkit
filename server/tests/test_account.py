from models import User


def test_account_password_hashing():
    user = User.new("test", "test_pw")
    print(user.check_password("test_pw"), ": Should be true")
    print(user.check_password("test_notpw"), ": Should be false")
