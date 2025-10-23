from __future__ import annotations
from dataclasses import dataclass
from typing import Iterable, List, Set, Optional
import argparse


@dataclass
class GameSnapshot:
    active_summoner: Optional[str] = None
    kills: int = 0
    deaths: int = 0
    assists: int = 0
    level: int = 1
    gold: int = 0
    team_total_kills: int = 0
    game_time: float = 0.0  


def _dedupe(seq: Iterable[str]) -> List[str]:
    seen: Set[str] = set()
    out: List[str] = []
    for s in seq:
        if s not in seen:
            seen.add(s)
            out.append(s)
    return out


def generate_tips(prev: GameSnapshot | None, curr: GameSnapshot, role: str | None = None) -> Iterable[str]:
    """
    Role-based coaching nudges.
    General rules always apply; role-specific rules add on top.
    Roles: top, jungle, mid, adc, support
    """

    tips: List[str] = []

    if curr.game_time < 600 and curr.deaths >= 2:
        tips.append("Early deaths piling up—hug tower, thin waves safely, and track enemy jungler pathing.")

    if prev and curr.deaths > prev.deaths:
        tips.append("You just died—buy efficiently, fix vision around your next path, and avoid solo fights.")

    if curr.level < 6 and curr.game_time > 420:
        tips.append("Still not level 6—catch waves safely before taking risky skirmishes.")

    if curr.game_time >= 720 and curr.team_total_kills < 5:
        tips.append("Macro window—set vision, push side, or trade objectives instead of forcing 5v5s.")

    if curr.game_time >= 1200:
        tips.append("Objective setup—establish vision 30–45s early and group with priority before contesting.")

    if curr.kills >= 5 and curr.deaths <= 1 and curr.game_time >= 600:
        tips.append("You’re fed—avoid coin-flip fights; push advantage with vision and controlled picks.")

    if curr.deaths >= 5 and curr.game_time >= 900:
        tips.append("High death count—slow down. Catch safe waves, farm camps, and fight with numbers/tempo.")

    if curr.gold >= 1300 and (not prev or curr.gold - prev.gold >= 700):
        tips.append("Sitting on a lot of gold—consider a reset for item spike before the next fight.")

    if curr.game_time >= 600:
        tips.append("Vision wins games—refresh wards on objectives and deny enemy vision before engaging.")

    if role:
        r = role.strip().lower()

        if r == "top":
            if curr.game_time < 480 and curr.deaths >= 2:
                tips.append("Top: ward river/tri-brush and manage the wave near your tower to reduce gank angles.")
            if curr.level < 8 and curr.game_time > 900:
                tips.append("Top: behind in XP—catch side waves; don’t chase fights mid without TP value.")
            if curr.game_time >= 780:
                tips.append("Top: look for TP flanks only with vision and lane shoved; otherwise hold for counter-TP.")

        elif r == "jungle":
            if curr.game_time > 300 and curr.team_total_kills == 0:
                tips.append("Jungle: no early impact—path to a priority lane or secure early objective control.")
            if curr.game_time > 600 and curr.level < 6:
                tips.append("Jungle: XP behind—clear camps efficiently before contesting big objectives.")
            tips.append("Jungle: hover winning lanes for plates/drag setup; trade cross-map if losing prio.")

        elif r == "mid":
            if curr.game_time < 480 and curr.deaths >= 2:
                tips.append("Mid: early deaths—hug tower, ward both sides, and track enemy roams.")
            if curr.game_time >= 600 and curr.level < 9:
                tips.append("Mid: low XP—shove wave then roam with jungler; don’t take isolated fights.")
            tips.append("Mid: keep river/raptors warded and ping MIA before leaving lane.")

        elif r == "adc":
            if curr.game_time < 480 and curr.deaths >= 2:
                tips.append("ADC: early deaths—play back until support sets vision; trade only on cooldown spikes.")
            if curr.level < 8 and curr.game_time > 900:
                tips.append("ADC: farm/XP behind—focus on clean CS under tower; avoid chasing long fights.")
            tips.append("ADC: position behind frontline; hit closest target—survival > style in mid-game fights.")

        elif r == "support":
            if curr.game_time > 300 and curr.team_total_kills == 0:
                tips.append("Support: create impact—help shove for prio, roam mid for vision, or force timers.")
            if curr.game_time >= 600:
                tips.append("Support: rotate wards—control river/objectives; sweep key bushes before setup.")
            tips.append("Support: track enemy summoners and ping windows for your ADC to trade safely.")

        else:
            tips.append("Unknown role—apply fundamentals: vision, wave control, grouped fights on power spikes.")

    return _dedupe(tips)

def _parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Simulate LoL coaching tips.")
    p.add_argument("--role", type=str, default=None, help="top|jungle|mid|adc|support")
    p.add_argument("--time", type=float, default=600, help="Game time in seconds (e.g., 600 = 10:00)")
    p.add_argument("--kills", type=int, default=0)
    p.add_argument("--deaths", type=int, default=0)
    p.add_argument("--assists", type=int, default=0)
    p.add_argument("--level", type=int, default=6)
    p.add_argument("--gold", type=int, default=800)
    p.add_argument("--teamkills", type=int, default=3, help="Your team’s total kills (rough macro proxy)")
    p.add_argument("--prev-deaths", type=int, default=None)
    p.add_argument("--prev-level", type=int, default=None)
    p.add_argument("--prev-gold", type=int, default=None)
    return p.parse_args()


def _build_snap(args: argparse.Namespace) -> tuple[Optional[GameSnapshot], GameSnapshot]:
    prev = None
    if args.prev_deaths is not None or args.prev_level is not None or args.prev_gold is not None:
        prev = GameSnapshot(
            deaths=args.prev_deaths or 0,
            level=args.prev_level or 1,
            gold=args.prev_gold or 0,
            game_time=max(0.0, args.time - 10.0),  # just a small offset
        )

    curr = GameSnapshot(
        kills=args.kills,
        deaths=args.deaths,
        assists=args.assists,
        level=args.level,
        gold=args.gold,
        team_total_kills=args.teamkills,
        game_time=args.time,
    )
    return prev, curr


def main():
    args = _parse_args()
    prev, curr = _build_snap(args)
    tips = list(generate_tips(prev, curr, role=args.role))
    if not tips:
        print("No tips triggered for this snapshot. Try adjusting inputs.")
    else:
        print("=== Coaching Tips ===")
        for t in tips:
            print(f"- {t}")


if __name__ == "__main__":
    main()
