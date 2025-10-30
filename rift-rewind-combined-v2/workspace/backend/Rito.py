import requests
import json



def get_puuid(api_key, riot_id, region):
    """
    Fetches the PUUID of a given Riot ID.

    Args:
        api_key (str): Riot API key.
        riot_id (str): Riot username.
        region (str): Server region.

    Returns:
        tuple: (puuid, headers) if successful, None otherwise.
    """
    url = (
        f"https://europe.api.riotgames.com/riot/account/v1/"
        f"accounts/by-riot-id/{riot_id}/{region}"
    )
    headers = {"X-Riot-Token": api_key}

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  
        data = response.json()
        return data.get("puuid"), headers
    except requests.exceptions.RequestException as e:
        print(f"Error calling API: {e}")
        return None



def champ_master(puuid, headers):
    """
    Fetches the champion mastery data for a given PUUID.

    Args:
        puuid (str): Player's PUUID.
        headers (dict): HTTP headers including Riot API key.

    Returns:
        list: Champion mastery data as JSON.
    """
    url = (
        f"https://euw1.api.riotgames.com/lol/champion-mastery/v4/"
        f"champion-masteries/by-puuid/{puuid}"
    )

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        data = response.json()
        return data
    except requests.exceptions.RequestException as e:
        print(f"Error fetching champion mastery: {e}")
        return None


# Step 3: Get matches
def get_matches(api_key, puuid, region="europe", start=0, count=20):
    """
    Fetches match IDs for a given player's PUUID.

    Args:
        api_key (str): Riot API key.
        puuid (str): Player's PUUID.
        region (str): Riot server region (default: "europe").
        start (int): Index to start fetching matches (default: 0).
        count (int): Number of matches to fetch (default: 20).

    Returns:
        list: List of match IDs if successful, None otherwise.
    """
    url = (
        f"https://{region}.api.riotgames.com/lol/match/v5/matches/"
        f"by-puuid/{puuid}/ids"
    )
    headers = {"X-Riot-Token": api_key}
    params = {"start": start, "count": count}

    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching matches: {e}")
        return None


# Step 4: Check match
def match(matchID, api_key, puuuid):

    url = f"https://europe.api.riotgames.com/lol/match/v5/matches/{matchID}?api_key={api_key}"
    response = requests.get(url)
    data = response.json()

    if data["info"]['gameMode'] in ("CLASSIC", "ARAM"):
        with open("output.json", "w") as file:
            file.write(json.dumps(data, indent=4))

    # initialize everything early so Python doesn’t scream later
    gamemode = data["info"]['gameMode']
    kills = deaths = assists = 0
    kills_total = deaths_total = assists_total = []
    items = []
    level_up_total_flat = skill_level_up_total_flat = []
    total_gold_total = xp_total = minions_killed_total = jungle_minions_killed_total = current_gold_total = []
    champion_stats_total = damage_stats_total = []
    first_blood = False
    total_wards_placed_flat = \
        total_wards_destroyed_flat = \
        total_plates_destroyed_flat = \
        elite_monster_kill_total_flat = []
    role = 0
    total_player_data = []
    for participant in data["info"]["participants"]:
        total_player_data.append(participant)
    for participant in data["info"]["participants"]:

        if participant["puuid"] == puuuid:
            url1 = f"https://europe.api.riotgames.com/lol/match/v5/matches/{matchID}/timeline?api_key={api_key}"
            response1 = requests.get(url1)
            data1 = response1.json()
            role = participant.get("teamPosition")


            with open("FramesGame/totaoutput.json", "w") as file:
                file.write(json.dumps(data1, indent=4))

            j = 0
            kills_details = []
            deaths_details = []
            assists_details = []
            first_level = [{"level": 1, "timestamp": "0 minutes, 0 seconds"}]
            level_up_total = [first_level]
            skill_level_total = []
            total_gold_total = []
            xp_total = []
            minions_killed_total = []
            jungle_minions_killed_total = []
            current_gold_total = []
            champion_stats_total = []
            damage_stats_total = []
            total_wards_placed = []
            total_wards_destroyed = []
            total_plates_destroyed = []
            elite_monster_kill_total = []
            feat_update_total = []
            buildings_destroyed_total_amount = []

            # find participant ID
            for p in data1["info"]["participants"]:
                if p['puuid'] == puuuid:
                    id = p['participantId']

            for frame in data1["info"]["frames"]:
                filename = "output" + str(j) + ".json"
                with open("FramesGame/" + filename, "w") as file:
                    file.write(json.dumps(frame, indent=4))
                j += 1
                if j >= 1:
                    (kills, deaths, assists, kills_details, deaths_details, assists_details, items,
                     levelupDetails, skilllevel, totalGold, xp, minions, jungleminions, currentGold, championStats,
                     damageStats, first_blood, wards_placed, wards_destroyed, turret_plate_destroyed, elite_monster_kill,
                     feat_update, buildings_destroyed_total) = framesevents(str(id), frame, j, kills, deaths, assists,
                                                                            kills_details, deaths_details,
                                                                            assists_details, items,
                                                                            first_blood)
                    kills_total.append(kills_details)
                    deaths_total.append(deaths_details)
                    level_up_total.append(levelupDetails)
                    skill_level_total.append(skilllevel)
                    total_gold_total.append(totalGold)
                    xp_total.append(xp)
                    minions_killed_total.append(minions)
                    jungle_minions_killed_total.append(jungleminions)
                    current_gold_total.append(currentGold)
                    champion_stats_total.append(championStats)
                    damage_stats_total.append(damageStats)
                    total_wards_placed.append(wards_placed)
                    total_plates_destroyed.append(turret_plate_destroyed)
                    elite_monster_kill_total.append(elite_monster_kill)
                    feat_update_total.append(feat_update)
                    buildings_destroyed_total_amount.append(buildings_destroyed_total)

            # flatten the nested lists
            level_up_total_flat = [item for sublist in level_up_total for item in sublist]
            skill_level_up_total_flat = [item for sublist in skill_level_total for item in sublist]
            total_wards_placed_flat = [item for sublist in total_wards_placed for item in sublist]
            total_wards_destroyed_flat = [item for sublist in total_wards_destroyed for item in sublist]
            total_plates_destroyed_flat = [item for sublist in total_plates_destroyed for item in sublist]
            elite_monster_kill_total_flat = [item for sublist in elite_monster_kill_total for item in sublist]
            feat_update_total_flat = [item for sublist in feat_update_total for item in sublist]
            buildings_destroyed_total_amount_flat = [item for sublist in buildings_destroyed_total_amount
                                                     for item in sublist]
            break  # exit after finding the participant

    return (kills, kills_total, deaths, deaths_total, assists, assists_total, items, level_up_total_flat,
            skill_level_up_total_flat, total_gold_total, xp_total, minions_killed_total, jungle_minions_killed_total, 
            current_gold_total, champion_stats_total, damage_stats_total, first_blood, total_wards_placed_flat, 
            total_wards_destroyed_flat, total_plates_destroyed_flat, elite_monster_kill_total_flat, participant, 
            role, gamemode, total_player_data, feat_update_total_flat, buildings_destroyed_total_amount_flat)


def format_timestamp(event):
    ts = event.get("timestamp", 0)
    return f"{ts // 60000} minutes, {(ts // 1000) % 60} seconds"


def handle_building_kill(event):
    timestamp = format_timestamp(event)
    building = {
        "Building Type": event["buildingType"],
        "Killer ID": event["killerId"],
        "Lane Type": event["laneType"],
        "Team ID": event["teamId"],
        "timestamp": timestamp
    }

    if event.get("buildingType") == "TOWER_BUILDING":
        building["Tower Type"] = event["towerType"]

    if event.get("assistingParticipantIds"):
        building["Assisting Participants"] = event["assistingParticipantIds"]

    return building


def handle_elite_monster_kill(event):
    details = {
        "Monster Type": event.get("monsterType"),
        "Team": event.get("killerTeamId"),
        "timestamp": format_timestamp(event)
    }
    if "monsterSubType" in event:
        details["Monster Sub Type"] = event.get("monsterSubType")
    if "position" in event:
        details["Position"] = event.get("position")

    return details


def handle_ward_event(event):
    return {
        "Ward Type": event.get("wardType"),
        "timestamp": format_timestamp(event)
    }


def handle_item_event(event):
    return {
        "type": event["type"],
        "itemId": event.get("itemId"),
        "timestamp": format_timestamp(event),
    }


def handle_turret_plate_destroyed(event):
    return {
        "Lane Type": event.get("laneType"),
        "timestamp": format_timestamp(event),
    }


def handle_level_up(event):
    return {
        "level": event.get("level"),
        "timestamp": format_timestamp(event),
    }


def handle_skill_level_up(event):
    slot_map = {1: "Q", 2: "W", 3: "E", 4: "R"}
    slot = slot_map.get(event.get("skillSlot"))
    return {
        "skill": slot,
        "timestamp": format_timestamp(event)
    }


def get_champion_stats(participant_frame):
    stats = participant_frame["championStats"]
    return {
        "Ability Haste": stats["abilityHaste"],
        "Ability Power": stats["abilityPower"],
        "Armor": stats["armor"],
        "Armor Pen": stats["armorPen"],
        "Armor Pen Percent": stats["armorPenPercent"],
        "Attack Damage": stats["attackDamage"],
        "Attack Speed": stats["attackSpeed"],
        "Bonus Armor Pen Percent": stats["bonusArmorPenPercent"],
        "Bonus Magic Pen Percent": stats["bonusMagicPenPercent"],
        "CC Reduction": stats["ccReduction"],
        "Cooldown Reduction": stats["cooldownReduction"],
        "Health": stats["health"],
        "Health Max": stats["healthMax"],
        "Health Regen": stats["healthRegen"],
        "Lifesteal": stats["lifesteal"],
        "Magic Pen": stats["magicPen"],
        "Magic Pen Percent": stats["magicPenPercent"],
        "Magic Resist": stats["magicResist"],
        "Movement Speed": stats["movementSpeed"],
        "Omnivamp": stats["omnivamp"],
        "Physical Vamp": stats["physicalVamp"],
        "Power": stats["power"],
        "Power Max": stats["powerMax"],
        "Power Regen": stats["powerRegen"],
        "Spell Vamp": stats["spellVamp"]
    }


def get_damage_stats(participant_frame):
    dmg = participant_frame["damageStats"]
    return {
        "Magic Damage Done": dmg["magicDamageDone"],
        "Magic Damage Done To Champions": dmg["magicDamageDoneToChampions"],
        "Magic Damage Taken": dmg["magicDamageTaken"],
        "Physical Damage Done": dmg["physicalDamageDone"],
        "Physical Damage Done To Champions": dmg["physicalDamageDoneToChampions"],
        "Physical Damage Taken": dmg["physicalDamageTaken"],
        "Total Damage Done": dmg["totalDamageDone"],
        "Total Damage Done To Champions": dmg["totalDamageDoneToChampions"],
        "Total Damage Taken": dmg["totalDamageTaken"],
        "True Damage Done": dmg["trueDamageDone"],
        "True Damage Done To Champions": dmg["trueDamageDoneToChampions"],
        "True Damage Taken": dmg["trueDamageTaken"]
    }


def handle_item_undo(event):
    return {
        "type": event.get("type"),
        "beforeId": event.get("afterId"),
        "afterId": event.get("beforeId"),
        "timestamp": format_timestamp(event)
    }


def framesevents(id, frame, time, kills, deaths, assists, kills_details, deaths_details_list, assists_details, 
                 items, first_blood):
    participantFrames = frame["participantFrames"]
    type_action = {}
    level = []
    skilllevel = []
    wards_placed = []
    wards_destroyed = []
    turret_plate_destroyed = []
    elite_monster_kill = []
    feat_update = []
    buildings_destroyed_total = []
    levelup_details = 0
    for i in frame["events"]:
        if i.get("participantId") == int(id):
            t = i["type"]
            type_action[t] = type_action.get(t, 0) + 1
            if t in ["ITEM_PURCHASED", "ITEM_DESTROYED", "ITEM_SOLD"]:
                items.append(handle_item_event(i))
            elif i.get("type") == "LEVEL_UP":
                level.append(handle_level_up(i))
            elif i.get("type") == "SKILL_LEVEL_UP":
                skill_level_up_details = handle_skill_level_up(i)
                skilllevel.append(skill_level_up_details)
            elif i.get("type") == "CHAMPION_SPECIAL_KILL":
                first_blood = True
            elif i.get("type") == "ITEM_UNDO":
                items.append(handle_item_undo(i))
        elif i.get("type") == "TURRET_PLATE_DESTROYED" and i.get("killerId") == int(id):
            turret_plate_destroyed.append(handle_turret_plate_destroyed(i))
        elif i.get("creatorId") == int(id) and i.get("type") in ["WARD_PLACED", "WARD_KILL"]:
            ward_details = handle_ward_event(i)
            if i["type"] == "WARD_PLACED":
                wards_placed.append(ward_details)
            else:
                wards_destroyed.append(ward_details)
        elif int(id) in i.get('assistingParticipantIds', []) and i.get("type") == 'CHAMPION_KILL':
            assists += 1
            assist_frame = support_details(i)
            assists_details.append(assist_frame)
        elif i.get("killerId") == int(id) and i.get("type") == 'CHAMPION_KILL':
            kills += 1
            kill_frame = killDetails(i)
            kills_details.append(kill_frame)
            type_action['CHAMPION_KILL'] = type_action.get('CHAMPION_KILL', 0) + 1
        elif i.get("victimId") == int(id):
            deaths += 1
            death_frame = deaths_details(i)
            deaths_details_list.append(death_frame)
        elif i.get("type") == 'ELITE_MONSTER_KILL':
            elite_monster_kill.append(handle_elite_monster_kill(i))
        elif i.get("type") == 'FEAT_UPDATE':
            feat_update.append(i)
        elif i.get("type") == 'BUILDING_KILL':
            buildings_destroyed_total.append(handle_building_kill(i))
        elif i.get("type") == 'OBJECTIVE_BOUNTY_PRESTART':
            print(i)
        elif i.get("type") == 'DRAGON_SOUL_GIVEN':
            print(i)
        elif i.get("type") == 'GAME_END':
            print(i)

    total_gold = participantFrames[id]["totalGold"]
    total_xp = participantFrames[id]["xp"]
    minions_killed = participantFrames[id]["minionsKilled"]
    jungle_minions_killed = participantFrames[id]["jungleMinionsKilled"]
    current_gold = participantFrames[id]["currentGold"]
    champion_stats = get_champion_stats(participantFrames[id])
    damage_stats = get_damage_stats(participantFrames[id])

    return (kills, deaths, assists, kills_details, deaths_details_list, assists_details, items,
            level, skilllevel, total_gold, total_xp, minions_killed, jungle_minions_killed, current_gold, champion_stats,
            damage_stats, first_blood, wards_placed, wards_destroyed, turret_plate_destroyed, elite_monster_kill,
            feat_update, buildings_destroyed_total)


def killDetails(i):
    killer_id = i.get("killerId")
    assist_ids = i.get("assistingParticipantIds", [])

    participants = {}
    for dmg in i.get("victimDamageDealt", []) + i.get("victimDamageReceived", []):
        participants[dmg["participantId"]] = dmg["name"]

    kill_details = {
        "killer": {
            "id": killer_id,
            "name": participants.get(killer_id, "Unknown")
        },
        "assists": [
            {"id": aid, "name": participants.get(aid, "Unknown")}
            for aid in assist_ids
        ],
        "bounty": i.get("bounty"),
        "killstreak": i.get("killStreakLength"),
        "position": i.get("position", {}),
        "damage_received": [
            {
                "name": d.get("name"),
                "basic": d.get("basic"),
                "magic": d.get("magicDamage"),
                "physical": d.get("physicalDamage"),
                "true": d.get("trueDamage"),
                "spell": d.get("spellName"),
                "slot": d.get("spellSlot"),
                "type": d.get("type"),
            }
            for d in i.get("victimDamageReceived", [])
        ],
    }

    return kill_details


def deaths_details(i):
    killer_id = i.get("killerId")
    assist_ids = i.get("assistingParticipantIds", [])

    participants = {}
    for dmg in i.get("victimDamageDealt", []) + i.get("victimDamageReceived", []):
        participants[dmg["participantId"]] = dmg["name"]

    death_details = {
        "killer": {
            "id": killer_id,
            "name": participants.get(killer_id, "Unknown")
        },
        "assists": [
            {"id": aid, "name": participants.get(aid, "Unknown")}
            for aid in assist_ids
        ],
        "bounty": i.get("bounty"),
        "killstreak": i.get("killStreakLength"),
        "position": i.get("position", {}),
        "damage_received": [
            {
                "name": d.get("name"),
                "basic": d.get("basic"),
                "magic": d.get("magicDamage"),
                "physical": d.get("physicalDamage"),
                "true": d.get("trueDamage"),
                "spell": d.get("spellName"),
                "slot": d.get("spellSlot"),
                "type": d.get("type"),
            }
            for d in i.get("victimDamageReceived", [])
        ],
    }
    return death_details


def support_details(i):
    killer_id = i.get("killerId")
    assist_ids = i.get("assistingParticipantIds", [])

    participants = {}
    for dmg in i.get("victimDamageDealt", []) + i.get("victimDamageReceived", []):
        participants[dmg["participantId"]] = dmg["name"]

    support_details = {
        "killer": {
            "id": killer_id,
            "name": participants.get(killer_id, "Unknown")
        },
        "assists": [
            {"id": aid, "name": participants.get(aid, "Unknown")}
            for aid in assist_ids
        ],
        "bounty": i.get("bounty"),
        "killstreak": i.get("killStreakLength"),
        "position": i.get("position", {}),
        "damage_received": [
            {
                "name": d.get("name"),
                "basic": d.get("basic"),
                "magic": d.get("magicDamage"),
                "physical": d.get("physicalDamage"),
                "true": d.get("trueDamage"),
                "spell": d.get("spellName"),
                "slot": d.get("spellSlot"),
                "type": d.get("type"),
            }
            for d in i.get("victimDamageReceived", [])
        ],
    }
    return support_details


def count_wards(wards_list):
    counts = {"YELLOW_TRINKET": 0, "CONTROL_WARD": 0, "BLUE_TRINKET": 0}
    for ward in wards_list:
        ward_type = ward.get("Ward Type")
        if ward_type in counts:
            counts[ward_type] += 1
    return counts


def feat_ana(feat_updates, teamid):
    """
    Analyze feat updates to determine if a team has more than 1 significant feat.

    feat_updates: list of feat update dicts
    teamid: int, either 100 (red) or 200 (blue)

    Returns: bool
    """
    feat_map = {0: "Kills", 1: "Turret", 2: "Objective"}

    teams = {
        100: {"Kills": 0, "Turret": 0, "Objective": 0, "score": 0},
        200: {"Kills": 0, "Turret": 0, "Objective": 0, "score": 0}
    }

    for feat in feat_updates:
        t_id = feat.get("teamId")
        f_type = feat.get("featType")
        f_value = feat.get("featValue")

        if (f_type == 0 and f_value == 3) or (f_type == 1 and f_value == 1) or (f_type == 2 and f_value == 3):
            key = feat_map[f_type]
            teams[t_id][key] = 1
            teams[t_id]["score"] += 1

    return teams[teamid]["score"] > 1


def main():
    api_key = "RGAPI-a2e6e238-7f15-44c5-8ad6-ada89a406c6c"
    username = "schinzi"
    region = "EUW"
    puuuid, headers = get_puuid(api_key, username, region)
    # champData = champ_master(puuuid, headers)
    matchess = get_matches(api_key, puuuid)
    for match_id in matchess:
        (kills, kills_total, deaths, deaths_total, assists, assists_total, items, level_up_total,
         skill_level_total, total_gold_total, xp_total, minions_killed_total, jungle_minions_killed_total,
         current_gold_total, champion_stats_total, damage_stats_total, first_blood, totalwards,
         total_wards_destroyed_flat, total_plates_destroyed, elite_monster_kill_total_flat, participant,
         role, gamemode, total_player_data, feat_update_total_flat, buildings_destroyed_total_amount_flat) \
            = match(match_id, api_key, puuuid)

        counts = count_wards(totalwards)
        countsdestroyed = count_wards(total_wards_destroyed_flat)
        print("\n")
        print("Gamemode: ", gamemode)
        print("Role: ", role)
        print("first_blood: ", first_blood, " Kills: ", kills, " Deaths: ", deaths, " Assists: ", assists)
        print("Items: ", items)
        print("Level: ", level_up_total)
        print("Skill Level: ", skill_level_total)
        print("Total Gold: ", total_gold_total)
        print("Current Gold: ", current_gold_total)
        print("XP: ", xp_total)
        print("Minions: ", minions_killed_total)
        print("Jungle Minions: ", jungle_minions_killed_total)
        print("Champion Stats Total: ", champion_stats_total)
        print("Damage Stats Total: ", damage_stats_total)
        total_minions = []
        for i in range(len(minions_killed_total)):
            total_minions.append(minions_killed_total[i] + jungle_minions_killed_total[i])
        print("Total Minions: ", total_minions)
        print("Total Wards Placed: ", totalwards)
        print("Total Buildings Destroyed ", buildings_destroyed_total_amount_flat)
        print("Distribution Wards/Tokens: ", counts)
        print("Total Wards destroyed: ", total_wards_destroyed_flat)
        print("Distribution Wards/Tokens Destroyed: ", countsdestroyed)
        print("Total Plates Destroyed: ", total_plates_destroyed)
        print("Total Plates Destroyed (Number): ", len(total_plates_destroyed))
        print("Elite Monster Kill Total: ", elite_monster_kill_total_flat)
        print("Participant All in All Information: ", participant)
        print("Feat Update: ", feat_update_total_flat)
        feat_won = feat_ana(feat_update_total_flat, participant["teamId"])
        print("Feat Won?: ", feat_won)
        if len(total_plates_destroyed) > 0:
            quit()


if __name__ == "__main__":
    main()
