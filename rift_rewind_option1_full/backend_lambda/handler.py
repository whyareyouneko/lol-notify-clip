# handler.py — entrypoint: handler.lambda_handler
import json
import os
import time
import random
import urllib.request
import urllib.parse
import urllib.error
import statistics
import boto3

# ===== Env =====
RIOT_API_KEY = os.environ.get("RIOT_API_KEY", "")
DEFAULT_ROUTING_REGION = os.environ.get("RIOT_REGION_ROUTING", "americas")
BEDROCK_REGION = os.environ.get("BEDROCK_REGION", "us-east-1")
MODEL_ID = os.environ.get("MODEL_ID", "anthropic.claude-3-haiku-20240307-v1:0")

bedrock = boto3.client("bedrock-runtime", region_name=BEDROCK_REGION)


# ===== HTTP util with CORS =====
def _http(status, body_dict):
    allow = os.environ.get("CORS_ALLOW_ORIGIN", "*")
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": allow,
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
        "body": json.dumps(body_dict),
    }


# ===== Riot HTTP =====
def _riot_get(url):
    if not RIOT_API_KEY:
        raise RuntimeError("RIOT_API_KEY not configured")
    headers = {"X-Riot-Token": RIOT_API_KEY}
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=8) as resp:
        return json.loads(resp.read())


# ===== Request parsing =====
def _get_params(event):
    qs = event.get("queryStringParameters") or {}
    body = event.get("body")
    if isinstance(body, str):
        try:
            body = json.loads(body)
        except Exception:
            body = {}
    elif body is None:
        body = {}
    return qs, body


# ===== Core Riot helpers =====
def _get_puuid_by_riot_id(game_name, tag_line, routing_region):
    if not game_name or not tag_line:
        raise ValueError("missing gameName or tagLine")
    safe_name = urllib.parse.quote(game_name)
    safe_tag = urllib.parse.quote(tag_line)
    url = (
        f"https://{routing_region}.api.riotgames.com/riot/account/v1/accounts/"
        f"by-riot-id/{safe_name}/{safe_tag}"
    )
    data = _riot_get(url)
    return data["puuid"]


def _load_recent_matches(game_name, tag_line, max_matches, routing_region):
    puuid = _get_puuid_by_riot_id(game_name, tag_line, routing_region)
    base = f"https://{routing_region}.api.riotgames.com/lol/match/v5"
    url_ids = f"{base}/matches/by-puuid/{puuid}/ids?start=0&count={max_matches}"
    match_ids = _riot_get(url_ids)
    matches = []
    for mid in match_ids:
        url = f"{base}/matches/{mid}"
        m = _riot_get(url)
        matches.append(m)
        time.sleep(0.12)
    return puuid, matches


def _build_player_bundle(game_name, tag_line, routing_region, max_matches=10):
    puuid, matches = _load_recent_matches(
        game_name, tag_line, max_matches=max_matches, routing_region=routing_region
    )

    total_games = len(matches)
    if total_games == 0:
        overview = {"games_analyzed": 0}
        return overview, []

    wins = 0
    kills = deaths = assists = 0
    cs = 0
    minutes = 0.0
    champs = {}
    recent_games = []

    for m in matches:
        info = m.get("info", {})
        dur = info.get("gameDuration", 0)
        if dur > 0:
            minutes += float(dur) / 60.0

        player = None
        for p in info.get("participants", []):
            if p.get("puuid") == puuid:
                player = p
                break
        if not player:
            continue

        if player.get("win"):
            wins += 1
        k = player.get("kills", 0)
        d = player.get("deaths", 0)
        a = player.get("assists", 0)
        kills += k
        deaths += d
        assists += a
        cs_this = player.get("totalMinionsKilled", 0) + player.get(
            "neutralMinionsKilled", 0
        )
        cs += cs_this

        champ = player.get("championName", "Unknown")
        champs[champ] = champs.get(champ, 0) + 1

        game_duration = info.get("gameDuration", 0)
        mins = float(game_duration) / 60.0 if game_duration else 0.0
        cs_per_min = cs_this / mins if mins > 0 else 0.0
        kda = (k + a) / float(d) if d > 0 else float(k + a)
        game_ts = info.get("gameCreation", 0)
        queue = info.get("queueId")
        mode = info.get("gameMode") or info.get("gameType") or str(queue)

        recent_games.append(
            {
                "match_id": m.get("metadata", {}).get("matchId"),
                "timestamp": game_ts,
                "queue_id": queue,
                "game_mode": mode,
                "game_duration": game_duration,
                "champion": champ,
                "role": player.get("teamPosition") or player.get("role") or "",
                "kills": k,
                "deaths": d,
                "assists": a,
                "kda": round(kda, 2),
                "cs": cs_this,
                "cs_per_min": round(cs_per_min, 2),
                "gold": player.get("goldEarned", 0),
                "win": bool(player.get("win")),
            }
        )

    fav_champ = "Unknown"
    if champs:
        fav_champ = max(champs.items(), key=lambda x: x[1])[0]

    winrate = float(wins) / float(total_games) * 100.0
    avg_kills = float(kills) / float(total_games)
    avg_deaths = float(deaths) / float(total_games)
    avg_assists = float(assists) / float(total_games)
    kda_overall = (kills + assists) / float(deaths) if deaths > 0 else float(
        kills + assists
    )
    cs_per_min_overall = cs / minutes if minutes > 0 else 0.0

    overview = {
        "games_analyzed": total_games,
        "wins": wins,
        "winrate": round(winrate, 1),
        "avg_kills": round(avg_kills, 1),
        "avg_deaths": round(avg_deaths, 1),
        "avg_assists": round(avg_assists, 1),
        "kda": round(kda_overall, 2),
        "cs_per_min": round(cs_per_min_overall, 2),
        "favorite_champion": fav_champ,
    }

    return overview, recent_games


# ===== Bedrock coaching =====
def _call_bedrock(overview, lane_hint=None, deltas_block=None):
    sys_prompt = (
        "You are an honest but constructive League of Legends coach. "
        "You receive aggregated stats and optionally deltas vs higher-tier medians. "
        "Explain strengths, weaknesses, and 3–5 concrete habits to focus on. "
        "Be short, lane-specific, and actionable. Avoid generic advice."
    )
    if lane_hint:
        sys_prompt += f" The player mainly plays {lane_hint}."

    user_text = "Overview JSON:\n" + json.dumps(overview, indent=2)
    if deltas_block:
        user_text += "\n\nDeltas vs higher-tier medians:\n" + json.dumps(
            deltas_block, indent=2
        )

    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 300,
        "temperature": 0.6,
        "messages": [
            {"role": "system", "content": [{"type": "text", "text": sys_prompt}]},
            {"role": "user", "content": [{"type": "text", "text": user_text}]},
        ],
    }

    resp = bedrock.invoke_model(
        modelId=MODEL_ID,
        body=json.dumps(body),
        contentType="application/json",
        accept="application/json",
    )
    data = json.loads(resp["body"].read())
    text = ""
    for c in data.get("content", []):
        if c.get("type") == "text":
            text += c.get("text", "")
    return text.strip()


# ===== Compare-lineup helpers =====
TIERS = [
    "IRON",
    "BRONZE",
    "SILVER",
    "GOLD",
    "PLATINUM",
    "EMERALD",
    "DIAMOND",
    "MASTER",
    "GRANDMASTER",
    "CHALLENGER",
]
QUEUE_SOLO = "RANKED_SOLO_5x5"


def _platform_from_region(routing_region, default_platform="na1"):
    return {
        "americas": "na1",
        "europe": "euw1",
        "asia": "kr",
        "sea": "sg2",
    }.get(routing_region, default_platform)


def _get_summoner_by_puuid(puuid, platform_region):
    url = (
        f"https://{platform_region}.api.riotgames.com/lol/summoner/v4/"
        f"summoners/by-puuid/{urllib.parse.quote(puuid)}"
    )
    return _riot_get(url)


def _get_summoner_by_id(summoner_id, platform_region):
    url = (
        f"https://{platform_region}.api.riotgames.com/lol/summoner/v4/"
        f"summoners/{urllib.parse.quote(summoner_id)}"
    )
    return _riot_get(url)


def _get_rank_entries_by_summoner(summoner_id, platform_region):
    url = (
        f"https://{platform_region}.api.riotgames.com/lol/league/v4/"
        f"entries/by-summoner/{urllib.parse.quote(summoner_id)}"
    )
    return _riot_get(url)


def _pick_user_tier(entries):
    best_key = None
    best_val = None
    for e in entries:
        if e.get("queueType") != QUEUE_SOLO:
            continue
        t = e.get("tier")
        d = e.get("rank", "IV")
        if not t or t not in TIERS:
            continue
        key = (TIERS.index(t), d)
        if best_key is None or key > best_key:
            best_key, best_val = key, (t, d)
    return best_val or ("GOLD", "IV")


def _bump_tier(tier, bump=1):
    try:
        idx = TIERS.index(tier)
    except ValueError:
        idx = TIERS.index("GOLD")
    idx = min(len(TIERS) - 1, idx + max(0, min(2, int(bump))))
    return TIERS[idx]


def list_match_ids_last_year(puuid, routing_region):
    now = int(time.time())
    one_year_ago = now - 365 * 24 * 60 * 60
    base = f"https://{routing_region}.api.riotgames.com/lol/match/v5"
    qp = {"startTime": one_year_ago, "endTime": now, "start": 0, "count": 100}
    out = []
    max_total = 2000
    while True:
        qp["start"] = len(out)
        qs = urllib.parse.urlencode(qp)
        url = f"{base}/matches/by-puuid/{urllib.parse.quote(puuid)}/ids?{qs}"
        try:
            batch = _riot_get(url)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(1.2)
                batch = _riot_get(url)
            else:
                raise
        if not batch:
            break
        out.extend(batch)
        if len(out) >= max_total:
            break
        time.sleep(0.2)
    return out


def _participants_by_team(match):
    parts = match.get("info", {}).get("participants", [])
    t1 = [p for p in parts if p.get("teamId") == 100]
    t2 = [p for p in parts if p.get("teamId") == 200]
    return t1, t2


def _lineup_signature(match):
    t1, t2 = _participants_by_team(match)
    champs1 = sorted([p.get("championName", "Unknown") for p in t1])
    champs2 = sorted([p.get("championName", "Unknown") for p in t2])
    return f"TEAM100:{','.join(champs1)}|TEAM200:{','.join(champs2)}"


def _snapshot_for_puuid(match, puuid):
    info = match.get("info", {})
    for p in info.get("participants", []):
        if p.get("puuid") == puuid:
            k, d, a = p.get("kills", 0), p.get("deaths", 0), p.get("assists", 0)
            gm = max(1, info.get("gameDuration", 0)) / 60.0
            cs = p.get("totalMinionsKilled", 0) + p.get("neutralMinionsKilled", 0)
            return {
                "k": k,
                "d": d,
                "a": a,
                "kda": (k + a) / float(d) if d > 0 else float(k + a),
                "cs": cs,
                "cs_per_min": cs / gm if gm > 0 else 0.0,
                "gold": p.get("goldEarned", 0),
                "win": bool(p.get("win")),
                "role": p.get("teamPosition") or p.get("role") or "",
            }
    return {}


def _median_or_zero(vals):
    vals = [v for v in vals if isinstance(v, (int, float))]
    return float(statistics.median(vals)) if vals else 0.0


def _aggregate_peer_medians(matches):
    kdas, csmins, golds, wins = [], [], [], []
    for m in matches:
        info = m.get("info", {})
        gm = max(1, info.get("gameDuration", 0)) / 60.0
        for p in info.get("participants", []):
            k, d, a = p.get("kills", 0), p.get("deaths", 0), p.get("assists", 0)
            kda = (k + a) / float(d) if d > 0 else float(k + a)
            cs = p.get("totalMinionsKilled", 0) + p.get("neutralMinionsKilled", 0)
            csmins.append(cs / gm if gm > 0 else 0.0)
            kdas.append(kda)
            golds.append(p.get("goldEarned", 0))
            wins.append(1.0 if p.get("win") else 0.0)
    return {
        "kda": _median_or_zero(kdas),
        "cs_per_min": _median_or_zero(csmins),
        "gold": _median_or_zero(golds),
        "winrate": _median_or_zero(wins),
    }


def _sample_peer_matches_same_lineup(
    signature_key, routing_region, platform_region, target_tier, sample_cap=40
):
    base = f"https://{routing_region}.api.riotgames.com/lol/match/v5"
    acc = []
    divisions = (
        ["I", "II", "III", "IV"]
        if target_tier not in ["MASTER", "GRANDMASTER", "CHALLENGER"]
        else ["I"]
    )
    for div in divisions:
        for _ in range(2):  # two pages per division
            page = random.randint(1, 5)
            try:
                url = (
                    f"https://{platform_region}.api.riotgames.com/"
                    f"lol/league-exp/v4/entries/{QUEUE_SOLO}/{target_tier}/{div}?page={page}"
                )
                entries = _riot_get(url)
            except Exception:
                entries = []
            random.shuffle(entries)
            for e in entries[:10]:  # small subset
                try:
                    summ_id = e["summonerId"]
                    summ = _get_summoner_by_id(summ_id, platform_region)
                    peer_puuid = summ["puuid"]
                    mids = _riot_get(
                        f"{base}/matches/by-puuid/{peer_puuid}/ids?start=0&count=10"
                    )
                    for mid in mids:
                        m = _riot_get(f"{base}/matches/{mid}")
                        if _lineup_signature(m) == signature_key:
                            acc.append(m)
                            if len(acc) >= sample_cap:
                                return acc
                        time.sleep(0.12)
                except urllib.error.HTTPError as ex:
                    if ex.code == 429:
                        time.sleep(1.3)
                    else:
                        continue
                except Exception:
                    continue
            if len(acc) >= sample_cap:
                break
        if len(acc) >= sample_cap:
            break
    return acc


# ===== Lambda entry =====
def lambda_handler(event, context):
    http = event.get("requestContext", {}).get("http", {})
    if http.get("method") == "OPTIONS":
        return _http(200, {"ok": True})

    qs, body = _get_params(event)
    action = (qs.get("action") or body.get("action") or "").strip()
    if not action:
        return _http(400, {"error": "missing_action"})

    routing_region = (
        qs.get("routingRegion") or body.get("routingRegion") or DEFAULT_ROUTING_REGION
    )
    platform_region = (
        qs.get("platformRegion")
        or body.get("platformRegion")
        or _platform_from_region(routing_region)
    )

    raw_count = qs.get("matchCount") or body.get("matchCount")
    try:
        max_matches = int(raw_count) if raw_count is not None else 10
    except Exception:
        max_matches = 10
    max_matches = max(1, min(50, max_matches))

    try:
        # health
        if action == "health":
            return _http(
                200,
                {"ok": True, "routing": routing_region, "platform": platform_region},
            )

        # recap
        if action == "getRecap":
            game_name = qs.get("gameName") or body.get("gameName")
            tag_line = qs.get("tagLine") or body.get("tagLine")

            if (
                not game_name
                or not tag_line
                or game_name == "undefined"
                or tag_line == "undefined"
            ):
                return _http(400, {"error": "missing_riot_id"})

            overview, recent_games = _build_player_bundle(
                game_name,
                tag_line,
                routing_region,
                max_matches=max_matches,
            )
            hidden_gem = "Strong " + overview.get("favorite_champion", "champion")
            return _http(
                200,
                {
                    "player_overview": overview,
                    "hidden_gem": hidden_gem,
                    "recent_games": recent_games,
                },
            )

        # summarize (single-player coaching)
        if action == "summarize":
            game_name = qs.get("gameName") or body.get("gameName")
            tag_line = qs.get("tagLine") or body.get("tagLine")
            lane_hint = body.get("lane") or qs.get("lane")

            if (
                not game_name
                or not tag_line
                or game_name == "undefined"
                or tag_line == "undefined"
            ):
                return _http(400, {"error": "missing_riot_id"})

            overview, _recent_games = _build_player_bundle(
                game_name,
                tag_line,
                routing_region,
                max_matches=max_matches,
            )
            summary = _call_bedrock(overview, lane_hint=lane_hint)
            return _http(200, {"summary": summary, "overview": overview})

        # compare lineup vs higher tier
        if action == "compare":
            puuid = qs.get("puuid") or body.get("puuid")
            game_name = qs.get("gameName") or body.get("gameName")
            tag_line = qs.get("tagLine") or body.get("tagLine")
            selected_ids = body.get("selectedMatchIds") or []
            tier_bump = int(body.get("tierBump") or 1)
            sample_cap = int(body.get("samplePerSignature") or 40)
            lane_hint = body.get("lane") or qs.get("lane")

            if not puuid:
                if (
                    not game_name
                    or not tag_line
                    or game_name == "undefined"
                    or tag_line == "undefined"
                ):
                    return _http(400, {"error": "missing_riot_id_or_puuid"})
                puuid = _get_puuid_by_riot_id(game_name, tag_line, routing_region)

            base = f"https://{routing_region}.api.riotgames.com/lol/match/v5"

            summ = _get_summoner_by_puuid(puuid, platform_region)
            entries = _get_rank_entries_by_summoner(summ["id"], platform_region)
            user_tier, _user_div = _pick_user_tier(entries)
            target_tier = _bump_tier(user_tier, bump=tier_bump)

            signatures = []
            deltas_for_llm = []

            for mid in selected_ids:
                m = _riot_get(f"{base}/matches/{urllib.parse.quote(mid)}")
                sig = _lineup_signature(m)
                user_snap = _snapshot_for_puuid(m, puuid)

                peers = _sample_peer_matches_same_lineup(
                    sig,
                    routing_region,
                    platform_region,
                    target_tier,
                    sample_cap=sample_cap,
                )
                peer_meds = _aggregate_peer_medians(peers)

                deltas = {
                    "kda": round(
                        user_snap.get("kda", 0.0) - peer_meds.get("kda", 0.0), 2
                    ),
                    "cs_per_min": round(
                        user_snap.get("cs_per_min", 0.0)
                        - peer_meds.get("cs_per_min", 0.0),
                        2,
                    ),
                    "gold": round(
                        float(user_snap.get("gold", 0.0))
                        - float(peer_meds.get("gold", 0.0)),
                        1,
                    ),
                    "win": (
                        1.0 if user_snap.get("win") else 0.0
                    ) - peer_meds.get("winrate", 0.0),
                }

                signatures.append(
                    {
                        "matchId": mid,
                        "signatureKey": sig,
                        "user_snapshot": user_snap,
                        "peer_medians": peer_meds,
                        "deltas": deltas,
                        "peer_sample_size": len(peers),
                        "target_tier": target_tier,
                    }
                )
                deltas_for_llm.append(
                    {"matchId": mid, "deltas": deltas, "peer_medians": peer_meds}
                )

                time.sleep(0.12)

            overview_stub = {
                "selected_matches": len(signatures),
                "user_tier": user_tier,
                "target_tier": target_tier,
            }
            coaching = _call_bedrock(
                overview_stub, lane_hint=lane_hint, deltas_block=deltas_for_llm
            )

            return _http(
                200,
                {
                    "signatures": signatures,
                    "coaching": coaching,
                    "routingRegion": routing_region,
                    "platformRegion": platform_region,
                },
            )

        return _http(400, {"error": "unknown_action"})

    except urllib.error.HTTPError as e:
        return _http(e.code, {"error": "riot_http_error", "detail": str(e)})
    except Exception as e:
        return _http(500, {"error": "server_error", "detail": str(e)})
