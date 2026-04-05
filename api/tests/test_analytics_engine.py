from app.services.analytics_engine import compute_diff


def test_unfollowers():
    result = compute_diff(
        prev_followers={"alice", "bob", "charlie"},
        curr_followers={"alice", "charlie"},
        prev_following=set(),
        curr_following=set(),
    )
    assert set(result["unfollowers"]) == {"bob"}
    assert result["new_followers"] == []


def test_new_followers():
    result = compute_diff(
        prev_followers={"alice"},
        curr_followers={"alice", "dave"},
        prev_following=set(),
        curr_following=set(),
    )
    assert set(result["new_followers"]) == {"dave"}
    assert result["unfollowers"] == []


def test_not_following_back():
    result = compute_diff(
        prev_followers=set(),
        curr_followers={"alice"},
        prev_following=set(),
        curr_following={"alice", "bob"},
    )
    assert set(result["not_following_back"]) == {"bob"}


def test_you_dont_follow_back():
    result = compute_diff(
        prev_followers=set(),
        curr_followers={"alice", "charlie"},
        prev_following=set(),
        curr_following={"alice"},
    )
    assert set(result["you_dont_follow_back"]) == {"charlie"}


def test_no_changes():
    followers = {"alice", "bob"}
    following = {"alice"}
    result = compute_diff(followers, followers, following, following)
    assert result["unfollowers"] == []
    assert result["new_followers"] == []
    assert set(result["not_following_back"]) == set()  # alice follows me and I follow back


def test_empty_sets():
    result = compute_diff(set(), set(), set(), set())
    assert result == {
        "unfollowers": [],
        "new_followers": [],
        "not_following_back": [],
        "you_dont_follow_back": [],
    }
