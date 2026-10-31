# HorseBrain

# Overview

**HorseBrain** \- *Race picks powered by machine learning*

[HorseBrain.com](http://HorseBrain.com) is a horse race betting tips site powered by state of the art machine learning and statistical inference. Users can track different races across different tracks and get free betting tips or pay to unlock premium insights. The site displays the previous performance of the bot across different bets, across different categories, tracks, jockeys, etc. 

# Tech Stack

[https\://nuxt.com/](https://nuxt.com/)   \- GitHub Pages \-\> Nuxt Hosting? (eventually)

FastAPI      \\

- Digital Ocean

MongoDB   /

# MVP Requirements

- Raceday overview  
- Race Overview  
- Race Overview Plus  
- Horse Overview

# Timeline

1. Framework/Vertical Slice  
   1. Basic HTML, static components for front end \+ structure to fetch data from database.  
2. Frontend Design  
   1. Thorough theme design and style installation, rebuilding the site with dynamic components  
3. MVP  
   1. Site is fully dynamic, loading information from DB calls for basic functions for horse betting/testing.  
   2. MVP Requirements:  
      1. Track overview  
         1. Has “Calendar”, a list of Racedays  
      2. Raceday overview  
         1. Belongs to a Track  
         2. Has list of Races  
         3. If currently racing \- displays live updates on current race  
      3. Race Overview  
         1. Belongs to a Raceday  
         2. Has list of (Horse, Jockey) pairs  
         3. Has “Race Details”, start time, length, current pot, estimated payouts, etc.  
      4. Race Details  
         1. Expanded view of the race details with jockey and horse details, weather and track details, change in odds over time  
      5. Horse Overview  
         1. Belongs to any number of Race(s) as a member of a (Horse, Jockey) pair   
         2. Has “Racing History”, a list of Race(s) with (Horse (self), Jockey) pairs  
      6. Jockey Overview  
         1. Belongs to any number of Race(s) as a member of a (Horse, Jockey) pair  
         2. Has “Racing History”, a list of Race(s) with (Horse, Jockey (self)) pairs  
4. V1 \- Live Data  
   1. Launch with proper domain  
   2. Add support for all major racetracks  
   3. Site is business-ready, with About page, Statistics Page, Predictions Page, Contact Us Page.  
   4. Free betting tips are available  
5. V2 \- User Accounts  
   1. Launch with user accounts  
   2. Logged in users can track their bets and get insights into their betting history   
   3. Users can choose to “use insights”, which creates an entry in their history in which they can report how much they bet and if they won or lost. They can use this to ‘simulate’ betting along with the bot, whether they spend the money or not.   
   4. DB begins recording user reporting data  
      1. What are typical user behaviors?  
      2. How much are users spending?  
      3. User demographics?  
6. V3 \- Premium Insights  
   1. Offer premium predictions/insights  
   2. Offer pricing plans for engaged users (pay-as-you-go or subscription)

**Future Updates**

7. VEX \- “Panel of Experts”  
   1. Introduce agents with different “personalities” to provide more in depth insights  
      1. Risk taker \- Believes big payoffs are worth the risk, especially if the cost is low  
      2. Risk averse \- Takes safe bets for modest payouts  
      3. Jockey matters \- Believes the quality of the Jockey is the most important attribute  
      4. Horse matters \- Believes the quality of the Horse is the most important attribute  
      5. Weather and track conditions matter \- Believes the quality of the Weather and Track Conditions is the most important attribute  
8. VIN \- Integrated Betting (*theoretical)*  
   1. Allow users to sign in with their betting platforms and place bets through the website, replacing the “use insights” functionality and integrating with their betting history.   
   2. Move previous “Use Insights” functionality into a “Simulated Betting Mode” that uses no money  
9. VUA \- User Agents  
   1. Unlock a personal AI that uses your personal betting history to recommend key bets whenever they are forecast  
10. VRC \- “Race Companion”  
    1. Printable picks sheet and schedule for the track you’re going to that can then be scanned back into your history as you fill out your picks and bets

# Backend Requirements

- Picks  
  - % Chance to Win: For a given ((horse, jockey), race), what does the model predict % chance to place 1st  
  - Most Likely Winner: For a given race, which (horse, jockey) does the model predict will win, with what probability, and with what confidence  
  - Best Value Bet: Which bet (horse to win / place / show) has the highest ratio of likelihood to win and payout  
  - WPS (Win \+ Place \+ Show)  
  - Exacta  
  - Trifecta  
- Racetracks  
  - Pull live dace data from each track  
- Featured Free Picks  
  - Highest confidence selections for current day or soonest upcoming  
    - Horse-by-horse analysis (which place does model predict for each horse and at what confidence)  
    - Premium Picks  
      - Most Likely Winner  
      - Best Value Bet  
      - Win / Place / Show  
      - Exacta  
      - Trifecta  
-   
- 

# The Frontend

## Theme and Design

**Brand guide:** `docs/BRANDING.md` is the working reference for colour, type, shape language, surfaces, voice and responsible-design rules.

- Inspired by Kentucky Bluegrass, the grass and dirt of the tracks, and the white paint, the site should have a rustic yet refined, natural but classy feel.  
  - Baby Blue \- \#85ABFF  
  - Espresso \- \#45201A  
  - Fern \- \#366B24  
  - White \- \#FFFFFF  
  - Shadow Grey \- \#1D1C21  
  - Brass \- \#C7A96B — the metallic "shine" colour. Reserved for **premium** content and **high-confidence** picks (corner brackets, inlay frames, active pick tabs, premium badges). Use it as an accent, never as a large fill or as text on white (use Brass Ink \#8A6D32 for text on light backgrounds).

- Accessibility rule: Baby Blue, Brass and the Live red fail contrast as text on white. On light backgrounds use their "ink" variants (Blue Ink \#3B67BF, Brass Ink \#8A6D32, Live Ink \#C23B3B). Full palette, tokens and usage rules live in **docs/CSS-GUIDE.md**; the source of truth in code is `assets/scss/base/_root.scss`.
- On baby-blue backgrounds, text and buttons are **black (Shadow Grey)**, never brown (Espresso).
- Typography: **Amagro** (display — headings, buttons, numbers) + **Raleway** (body / data text).
  - **Horse names are always Amagro; jockey / trainer / owner names are always Raleway.**
- Signature design elements:
  - **Mixed-cut border**: the HorseBrain card shape. **Sharp top-left and bottom-right corners, rounded top-right and bottom-left.** Every card, tile and photo panel uses it. A coloured bar on a card's left edge therefore runs straight off a sharp top corner instead of curling.
  - **The frame**: the brass treatment added to premium / featured / high-confidence cards. An inner hairline frame that follows the mixed-cut shape, plus brass corner brackets sitting exactly on the two sharp corners.
  - **Rail frame**: two white rail lines that cross and overlap at the **top-left** corner, fading out along each edge, like painted track rail (used on the site header, alongside the fading white rail along its bottom edge).
  - **Brass corner brackets**: sharp brackets on the **top-left and bottom-right** corners of cards, inside a hairline inner frame. They echo the rail frame, and are full-strength on premium / high-confidence items.
  - **Inlaid textured bands**: paper grain, crossed fibres, vignette and inset shadow so a section looks pressed into the page. Fern green for newsletter/CTA bands, baby blue for the homepage "Get Free Daily Picks". Used to add depth and layering between sections.
  - **Inlaid paper cards**: white, paper-textured cards set *into* a cream section with an inset top shadow, so the texture reads as beneath the surface (homepage Featured Free Picks).
  - **Inlaid borders**: double rules (solid outer + hairline inner) on full-width bands such as Currently Racing and the footer's "Currently in Development" band.

![][image1]

- [https\://coolors.co/palette/85abff-45201a-366b24-ffffff-1d1c21-c7a96b](https://coolors.co/palette/85abff-45201a-366b24-ffffff-1d1c21-c7a96b)

- [https\://material-you-slider.uiinitiative.com/](https://material-you-slider.uiinitiative.com/) idea, turn horizontal for races.

# Philosophy

### *Responsibility, Honesty, Excellence*

We want to always be honest about the quality of our predictions, which means being open about our methods and their success. As if we were a financial institution, we should disclose the histories of our agents' predictions compared with reality, and allow users to make decisions for themselves. This encourages us to continue to innovate, and ensures we never defraud our customers. 

We should strive toward high quality research, science, and engineering at all times. We should work to build a reputation as academic, rigorous, and transparent. This not only builds a relationship of trust with our users, it creates an internal motivation toward excellence and integrity.

“Addictiveness” or “Stickiness” should never be design goals, in fact we should be conscious of the danger of enabling those with gambling addictions when making design decisions. In concert with this effort there should be disclosures about the dangers of gambling, alerting and reporting methods to detect users suspected of dangerous behaviors, and incentives toward a simulated betting mode where no money is required. 

# Competitors

[https\://aihorsepicks.com/picks/belmont/](https://aihorsepicks.com/picks/belmont/)

I think this is our model \-\> [https\://racingdudes.com/free-picks/](https://racingdudes.com/free-picks/)

- Displays winnings to date per different bet  
- Shows payouts from picks in last week  
- Offers free picks (winner of each race on the track) as well as premium detailed picks (today’s Most Likely Winner, Best Value and expert WPS, Exacta, and Trifecta picks)  
- “All access” subscription offerings (30 days, 90 days, 180 days) as well as “Day pass” one-day offerings (one track or all tracks)  
- Has “Bet Now \- use code at [twinspires.com](http://twinpeaks.com) to unlock 100% deposit match on your first 100 dollars

# Using the HorseBrain API

## Authentication

To have some semblance of authentication, the API only responds to requests with the request header {‘x-api-key’: ‘this\_is\_a\_dumb\_password\_which\_SHOULD\_be\_replaced420’}.

The IP and port of the production server is 137.184.200.165:8000

A detailed list of all the return types can be found [here](https://github.com/OFSkean/horsebrain/blob/main/HorseBrain/api/object_definitions.py)

## API Endpoints

### URL:  /

This is the root url to test connection and authentication. Will return a success message.

curl \--location 'localhost:8000' \\  
\--header 'x-api-key: this\_is\_a\_dumb\_password\_which\_SHOULD\_be\_replaced420'

{  
    "message": "Welcome to HorseBrain API"  
}

### URL:  /racedays-today

Returns a list of todays racedays. Each race contains a lot of information, so the list contains the bare minimum info about the raceday. For more detailed information for a particular raceday, make subsequent calls to the endpoint **/racedays/{track}/{date}.**

curl \--location 'localhost:8000/racedays-today' \\  
\--header 'x-api-key: this\_is\_a\_dumb\_password\_which\_SHOULD\_be\_replaced420'

\[  
    {  
        "date": "2024-10-19T00:00:00",  
        "track\_id": "RP",  
        "num\_races": 9  
    },  
    {  
        "date": "2024-10-19T00:00:00",  
        "track\_id": "DED",  
        "num\_races": 9  
    },  
    {  
        "date": "2024-10-19T00:00:00",  
        "track\_id": "EVD",  
        "num\_races": 7  
    },

   . . . 

### URL: /racedays/{date}

Looks up all the racedays on a particular date. The date is formatted as ‘YYYY-MM-DD’.

curl \--location 'localhost:8000/racedays/2024-07-27' \\  
\--header 'x-api-key: this\_is\_a\_dumb\_password\_which\_SHOULD\_be\_replaced420'

\[  
    {  
        "date": "2024-07-27T00:00:00",  
        "track\_id": "EVD",  
        "num\_races": 10  
    },  
    {  
        "date": "2024-07-27T00:00:00",  
        "track\_id": "CBY",  
        "num\_races": 9  
    },  
    {  
        "date": "2024-07-27T00:00:00",  
        "track\_id": "CNL",  
        "num\_races": 9  
    },

### URL: /racedays/{track}/{date}/{race\_num}

Returns the complete list of detailed information about a particular race. Includes the race conditions, distance, track condition, as well as every horse. If the race has already happened, then the race object has a list of performances which details how the horse did. There is also always a list of participants which details each horse.

curl \--location 'localhost:8000/racedays/2024-07-27/FAN/6' \\  
\--header 'x-api-key: this\_is\_a\_dumb\_password\_which\_SHOULD\_be\_replaced420'

{  
    "race\_id": "FAN072724USA6",  
    "race\_num": 6,  
    "race\_type": "Allowance Optional Claiming",  
    "distance": "6 F",  
    "surface": "Dirt",  
    "purse": 20000,  
    "performances": \[  
        {  
     "horse\_equibase\_refid": "10359586",  
     "horse\_name": "Racetothefinish",  
            "finish\_position": 1,  
            "equibase\_speed\_figure": null,  
            "race\_equibase\_refid": null,  
            "weight": 124,  
            "equipment": "L",  
            "pgm\_number": "3",  
            "odds": "3.70",  
            "speeds\_fractions": {  
                "PP": "2",  
                "Start": "2",  
                "1/4": "12",  
                "1/2": "12",  
                "Str": "12",  
                "Fin": "11"  
            },  
            "last\_raced": "22Jun24 6FAN3",  
            "comments": "2-3path,driftd out str",  
            "ind\_time": null  
        },  
   . . . . .   
    "participants": \[  
        {  
            "horse": {  
                "equibase\_refid": "10613841",  
                "sex": null,  
                "birthdate": "2019-04-07T00:00:00",  
                "workouts": \[  
                    {  
                        "date": "2023-06-16T00:00:00",  
                        "distance": "Four Furlongs",  
                        "workout\_equibase\_refid": "FAN061623USA-EQB",  
                        "surface": "Dirt",  
                        "track\_condition": "Fast",  
                        "finish\_time": "48.60",  
                        "rank": "2/14"  
                    },  
                    {  
                        "date": "2023-06-30T00:00:00",  
                        "distance": "Four Furlongs",  
                        "workout\_equibase\_refid": "FAN063023USA-EQB",  
                        "surface": "Dirt",  
                        "track\_condition": "Fast",  
                        "finish\_time": "49.40",  
                        "rank": "2/11"  
                    },  
                   . . . . . . .   
		   \],

                "races": \[  
                    {  
                        "track\_id": "FAN",  
                        "date": "2022-05-17T00:00:00",  
                        "race\_num": 5,  
                        "race\_type": "Maiden Special Weight",  
                        "finish\_position": 1,  
                        "equibase\_speed\_figure": 56  
                    },  
                    {  
                        "track\_id": "FAN",  
                        "date": "2022-05-03T00:00:00",  
                        "race\_num": 5,  
                        "race\_type": "Maiden Special Weight",  
                        "finish\_position": 2,  
                        "equibase\_speed\_figure": 40  
                    }  
				. . . . . . . .  
                \],  
                "yearly\_stats": \[  
                    {  
                        "year": 2023,  
                        "starts": 3,  
                        "wins": 1,  
                        "seconds": 1,  
                        "thirds": 0,  
                        "earnings": 18880.0  
                    },  
                    {  
                        "year": 2022,  
                        "starts": 10,  
                        "wins": 4,  
                        "seconds": 2,  
                        "thirds": 1,  
                        "earnings": 73950.0  
                    }  
                \],  
                "lifetime\_earnings": 92830.0,  
                "parent\_stats": {  
                    "sire\_id": "9106192",  
                    "dam\_id": "8856910",  
                    "sire\_lifetime\_earnings": 1154000.0,  
                    "dam\_lifetime\_earnings": 32342.0,  
                    "sire\_quality\_score": null,  
                    "dam\_quality\_score": null  
                }  
	      },   
            "jockey": {  
                "equibase\_refid": "130270",  
                "name": "Victor Santiago",  
                "quality\_score": null  
            },

            "trainer": {  
                "equibase\_refid": "968800",  
                "name": "Lori Plasters",  
                "quality\_score": null  
            },  
            "owner": {  
                "equibase\_refid": "2305820",  
                "name": "The Estate of Kenneth H. Hutchens",  
                "quality\_score": null  
            },  
            "breeder": null,  
            "quality\_score": null,  
            "predicted\_finish\_position": null,  
            "predicted\_odds": null,  
            "bookmaker\_odds": null  
        },

### URL: /horses/{equibase\_refid}

This returns very detailed data for a particular horse. The argument, which is the horses unique Equibase reference code, can be gotten from racedays or sire/dam and used as needed.

curl \--location 'localhost:8000/horses/10981467' \\  
\--header 'x-api-key: this\_is\_a\_dumb\_password\_which\_SHOULD\_be\_replaced420'

{  
   "equibase\_refid": "10981467",  
    "name": "Follow Your Arrow",  
    "sex": null,  
    "birthdate": "2021-05-02T00:00:00",  
    "workouts": \[  
        {  
            "date": "2023-06-07T00:00:00",  
            "distance": "Four Furlongs",  
            "workout\_equibase\_refid": "BEL060723USA-EQB",  
            "surface": "Dirt training",  
            "track\_condition": "Fast",  
            "finish\_time": "48.71",  
            "rank": "2/21"  
        }  
        . . . . . . .  
	\]  
    "races": \[  
        {  
            "track\_id": "BEL",  
            "date": "2023-05-12T00:00:00",  
            "race\_num": 1,  
            "race\_type": "Maiden Special Weight",  
            "finish\_position": "4",  
            "equibase\_speed\_figure": 58,  
            "race\_equibase\_refid": null  
        }  
	. . . . . . . .  
    \],  
    "yearly\_stats": \[  
        {  
            "year": 2023,  
            "starts": 1,  
            "wins": 0,  
            "seconds": 0,  
            "thirds": 0,  
            "earnings": 4500.0  
        }  
    \],  
    "lifetime\_earnings": 4500.0,  
    "parent\_stats": {  
        "sire\_id": "9490046",  
        "dam\_id": "10087263",  
        "sire\_lifetime\_earnings": 1258268.0,  
        "dam\_lifetime\_earnings": 0.0,  
        "sire\_quality\_score": null,  
        "dam\_quality\_score": null  
    }  
      


[image1]: <data:image/png;base64,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>