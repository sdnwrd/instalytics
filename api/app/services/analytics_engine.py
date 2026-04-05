from dataclasses import dataclass


@dataclass
class DiffResult:
    unfollowers: list[str]
    new_followers: list[str]
    not_following_back: list[str]
    you_dont_follow_back: list[str]

    def to_dict(self) -> dict:
        return {
            "unfollowers": self.unfollowers,
            "new_followers": self.new_followers,
            "not_following_back": self.not_following_back,
            "you_dont_follow_back": self.you_dont_follow_back,
        }


def compute_diff(
    prev_followers: set[str],
    curr_followers: set[str],
    prev_following: set[str],
    curr_following: set[str],
) -> dict:
    """
    Compute the difference between two snapshots.
    All sets contain Instagram user IDs (strings).
    """
    return DiffResult(
        unfollowers=sorted(prev_followers - curr_followers),
        new_followers=sorted(curr_followers - prev_followers),
        not_following_back=sorted(curr_following - curr_followers),
        you_dont_follow_back=sorted(curr_followers - curr_following),
    ).to_dict()
