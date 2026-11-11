# IPL & T20I CRICKET DATASET - DATA DICTIONARY

## Dataset Overview

**Total Records**: 237,176 rows across 6 CSV files  
**Coverage**: IPL (2022-2026) and International T20I (2022-2026)  
**Granularity**: Ball-by-ball delivery data with match context

---

## 1. ball_by_ball.csv (201,000 rows, 33 columns)

**Primary Key**: Composite (match_id, innings, innings_ball_num)  
**Description**: Every legal and illegal delivery bowled in matches

### Match Context Columns
| Column | Type | Description | Example |
|--------|------|-------------|---------|
| match_id | int | Unique match identifier | 13511 |
| innings | int | Innings number (1 or 2) | 1 |
| overid | int | Over number (1-20 for T20) | 16 |
| over_ball_num | int | Ball number within over (1-6) | 3 |
| innings_ball_num | int | Sequential ball number in innings | 98 |
| batting_team_id | int | ID of batting team | 22 |
| bowling_team_id | int | ID of bowling team | 28 |
| delivery_ist_time | datetime | Delivery timestamp (IST) | 2022-01-23 00:00:00 UTC |

### Player Identification Columns
| Column | Type | Description | Example |
|--------|------|-------------|---------|
| striker_id | int | Batsman on strike | 1187 |
| striker_name | string | Batsman name | Jason Roy |
| non_striker_id | int | Non-striker batsman | 6273 |
| non_striker_name | string | Non-striker name | Tom Banton |
| bowler_id | int | Bowler ID | 1772 |
| bowler_name | string | Bowler name | Sheldon Cottrell |
| batting_type | string | Batting hand (RHB/LHB) | RHB |
| bowling_type | string | Bowling style | Left-arm fast-medium |
| batting_order | int | Batting position (1-11) | 1 |

### Scoring Columns
| Column | Type | Description | Notes |
|--------|------|-------------|-------|
| runs | int | Runs scored off bat | 0-6 |
| is_four | boolean | Boundary (4 runs) | true/false |
| is_six | boolean | Six | true/false |
| is_wicket | boolean | Wicket on this ball | true/false |
| dismissal_type_id | int | Dismissal mode ID | null if not out |
| dismissal_type | string | Dismissal name | Bowled, Caught, LBW, etc. |
| dismissed_player_id | int | Player dismissed | Same as striker for most |

### Extras Columns
| Column | Type | Description | Values |
|--------|------|-------------|--------|
| extras_type | string | Type of extra | wide, no-ball, bye, leg-bye, None |
| extras1_runs | int | Primary extra runs | Usually 1 for wide/no-ball |
| extras_2_runs | int | Additional runs off extra | 0-4 |

### Bowling Metadata Columns
| Column | Type | Description | Example |
|--------|------|-------------|---------|
| pace_or_spin | string | Bowling category | Pace, Spin |
| bowl_speed | int | Speed in km/h | 0 (missing often) |
| stroke | string | Shot played | Cover Drive, Pull shot |
| delivery_style | string | Ball type | Inswing, Yorker, Bouncer |
| over_or_around | string | Bowling position | Over, Around |
| on_or_off | string | Line of delivery | Off-side, On-side |

### Key Data Quality Notes
- **runs**: Runs off the bat (does NOT include extras)
- **extras1_runs** and **extras2_runs**: Must be added separately for total runs
- **Wides/No-balls**: Still appear as rows (legal delivery = runs + extras_type == None)
- **Run-outs**: dismissal_type = "Run Out", bowler NOT credited with wicket
- **bowl_speed**: Often 0 or missing (unreliable)
- **Missing values**: Some matches lack timestamp, stroke, or delivery_style

---

## 2. matches.csv (884 rows, 21 columns)

**Primary Key**: match_id  
**Description**: Match-level metadata and results

### Match Identification
| Column | Type | Description | Example |
|--------|------|-------------|---------|
| match_id | int | Unique match ID | 13511 |
| comp_id | int | Competition ID | 1358 (IPL 2022) |
| match_number | int | Match number in competition | 1 |
| match_date | date | Match date | 2022-01-22 |
| stage | string | Match stage | League, Semi-Final, Final |
| venue_id | int | Venue ID | 54 |
| venue_country | string | Country | India, West Indies |

### Team Information
| Column | Type | Description | Example |
|--------|------|-------------|---------|
| home_team_id | int | Home team ID | 28 |
| home_team | string | Home team name | West Indies |
| away_team_id | int | Away team ID | 22 |
| away_team | string | Away team name | England |
| home_team_captain_id | int | Captain ID (often null) | null |
| away_team_captain_id | int | Captain ID (often null) | null |

### Match Setup
| Column | Type | Description | Example |
|--------|------|-------------|---------|
| toss_win_team_id | int | Toss winner | 28 |
| toss_opted | string | Toss decision | Batting, Fielding |
| man_of_the_match | int | Player ID | 0 (often 0) |

### Match Result
| Column | Type | Description | Example |
|--------|------|-------------|---------|
| win_team_id | int | Winning team ID | 28 |
| result | string | Result description | West Indies Won by 9 Wickets |
| knock_out | int | Knockout match? | 0 = No, 1 = Yes |

### Rain/Interruption Columns
| Column | Type | Description | Notes |
|--------|------|-------------|-------|
| first_inn_revised_overs | float | Reduced overs (1st inn) | null if no reduction |
| second_inn_revised_overs | float | Reduced overs (2nd inn) | null if no reduction |
| revised_target | int | DLS target | 0 if no revision |

### Key Notes
- **Target calculation**: Must be derived from innings 1 ball_by_ball data
- **Captains**: Often null/missing
- **Man of Match**: Often 0 (unreliable)

---

## 3. competitions.csv (142 rows, 4 columns)

**Primary Key**: comp_id  
**Description**: Competition metadata

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| comp_id | int | Competition ID | 1358 |
| comp_name | string | Full competition name | IPL 2022 |
| match_format | string | Format | T20, T20I, ODI |
| season | string | Year/season | 2022, 2022/23 |

### IPL Competitions (2022-2026)
- **1358**: IPL 2022
- **1715**: IPL 2023
- **2193**: IPL 2024
- **2725**: IPL 2025
- **3298**: IPL 2026

### T20I Competitions
- **134 T20I series** from 2022-2026 (bilateral series)

---

## 4. teams.csv (354 rows, 3 columns)

**Primary Key**: Composite (comp_id, team_id)  
**Description**: Team participation in competitions

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| comp_id | int | Competition ID | 1358 |
| team_id | int | Team ID | 3 |
| team_name | string | Team name | Rajasthan Royals |

### IPL Teams (Team IDs)
- **1**: Chennai Super Kings
- **2**: Mumbai Indians
- **3**: Rajasthan Royals
- **4**: Punjab Kings
- **5**: Royal Challengers Bengaluru
- **7**: Delhi Capitals
- **8**: Kolkata Knight Riders
- **242**: Sunrisers Hyderabad
- **3508**: Gujarat Titans (2022+)
- **3509**: Lucknow Super Giants (2022+)

---

## 5. competition_team_player_mapping.csv (6,414 rows, 6 columns)

**Primary Key**: Composite (comp_id, team_id, player_id)  
**Description**: Player-team-competition associations

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| comp_id | int | Competition ID | 1358 |
| comp_name | string | Competition name | IPL 2022 |
| team_id | int | Team ID | 3 |
| team_name | string | Team name | Rajasthan Royals |
| player_id | int | Player ID | 2258 |
| player_name | string | Player name | Sanju Samson |

**Usage**: Map player_id to player_name, identify team affiliations

---

## 6. playing_eleven.csv (28,382 rows, 9 columns)

**Primary Key**: Composite (match_id, team_id, player_id)  
**Description**: Playing XI for each match

| Column | Type | Description | Example |
|--------|------|-------------|---------|
| match_id | int | Match ID | 13511 |
| team_id | int | Team ID | 22 |
| player_id | int | Player ID | 1187 |
| batting_order | int | Batting position | 1 |
| is_played | boolean | Actually played? | true |
| is_captain | boolean | Captain? | false |
| is_wk | boolean | Wicket-keeper? | false |
| is_impact | int | Impact substitute | 0 |
| is_impact_off | int | Substituted off | 0 |

**Usage**: Identify match participation, captain, keeper

---

## Data Relationships

```
competitions.csv (comp_id) 
    ↓
matches.csv (comp_id, match_id)
    ↓
ball_by_ball.csv (match_id, innings)
    ├── striker_id → competition_team_player_mapping (player_name)
    ├── bowler_id → competition_team_player_mapping (player_name)
    └── batting_team_id, bowling_team_id → teams.csv (team_name)

playing_eleven.csv (match_id, team_id, player_id)
```

---

## Pressure Analysis Requirements

### Available Data for Pressure Calculation
✅ **Innings number** (innings)  
✅ **Over number** (overid)  
✅ **Ball number in innings** (innings_ball_num)  
✅ **Runs scored** (runs + extras)  
✅ **Wickets fallen** (is_wicket, dismissal_type)  
✅ **Match result** (win_team_id)  

### Derived Metrics Required
🔨 **Target score** (from innings 1 ball_by_ball aggregation)  
🔨 **Current score** (cumulative sum of runs + extras)  
🔨 **Wickets lost** (cumulative count of is_wicket)  
🔨 **Balls remaining** (120 - innings_ball_num)  
🔨 **Required run rate** (for innings 2)  
🔨 **Current run rate**  

### Data Limitations
❌ **No explicit target column** in matches.csv (must calculate)  
❌ **No ball-by-ball cumulative scores** (must derive)  
❌ **No explicit "pressure situation" flag** (must define)  
❌ **Run-outs ambiguous** (bowler not responsible)  
❌ **Extras attribution** (wide/no-ball adds to total but not runs column)  

---

## Dataset Statistics

### Volume
- **Total Deliveries**: 200,999
- **Total Matches**: 884
- **IPL Matches**: ~370 (2022-2026)
- **T20I Matches**: ~514 (2022-2026)
- **Unique Players**: ~1,200

### Coverage
- **IPL Seasons**: 5 (2022-2026)
- **T20I Series**: 134 bilateral series
- **Teams**: 354 team-competition combinations

---

## Data Quality Summary

### High Quality
✅ Match context (match_id, innings, over, ball)  
✅ Player identification (IDs and names)  
✅ Scoring (runs, wickets, dismissals)  
✅ Extras (type and runs)  

### Medium Quality
⚠️ Timestamps (some missing)  
⚠️ Captain IDs (often null)  
⚠️ Bowling metadata (stroke, delivery_style partially missing)  

### Low Quality
❌ Ball speed (mostly 0)  
❌ Man of the Match (often 0)  

---

## Usage for Pressure Performance System

### Required Preprocessing
1. **Join matches and ball_by_ball** on match_id
2. **Filter IPL and T20I** (comp_id IN 1358, 1715, 2193, 2725, 3298, + T20I)
3. **Calculate innings totals** for target determination
4. **Compute cumulative scores and wickets** per delivery
5. **Derive required run rate** for innings 2
6. **Handle extras correctly** (wides/no-balls add to total)
7. **Exclude run-outs** from bowler wicket tallies
8. **Map player IDs** to names via competition_team_player_mapping

### Minimum Sample Requirements
- **Batting**: ≥ 30 pressure balls faced
- **Bowling**: ≥ 24 pressure balls (4 overs)
- **Matches**: ≥ 5 separate matches with pressure situations

---

**Document Version**: 1.0  
**Last Updated**: Phase 1 Analysis  
**Competition**: IPL Pressure Performance Intelligence System - Round 1
